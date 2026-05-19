import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Comment, CreatePostData, Post, UpdatePostData } from '../types';
import { notificationService } from './NotificationService';
import { userService } from './UserService';

export type FeedOrder = 'desc' | 'asc';

class PostService {
  private static instance: PostService;

  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  public async create(data: CreatePostData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    console.log('[PostService] Creando publicacion -> authorId:', user.uid);

    await addDoc(collection(db, 'posts'), {
      content: data.content.trim(),
      imageURLs: data.imageURLs || [],
      authorId: user.uid,
      authorEmail: user.email,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      comments: 0,
    });
    console.log('[PostService] Publicacion creada en Firestore -> coleccion: posts');
  }

  public async getById(postId: string): Promise<Post | null> {
    console.log('[PostService] Consultando post por ID -> doc: posts/' + postId);
    const snap = await getDoc(doc(db, 'posts', postId));
    if (!snap.exists()) {
      console.warn('[PostService] Post no encontrado -> id:', postId);
      return null;
    }
    return { id: snap.id, ...snap.data() } as Post;
  }

  public async update(postId: string, data: UpdatePostData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');
    if (post.authorId !== user.uid) throw new Error('No puedes editar esta publicación');

    await updateDoc(doc(db, 'posts', postId), {
      content: data.content.trim(),
      imageURLs: data.imageURLs || [],
      editedAt: new Date(),
    });
    console.log('[PostService] Publicacion actualizada -> postId:', postId);
  }

  public async delete(postId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');
    if (post.authorId !== user.uid) throw new Error('No puedes eliminar esta publicación');

    await deleteDoc(doc(db, 'posts', postId));
    console.log('[PostService] Post eliminado -> postId:', postId);
  }

  public subscribeToFeed(
    callback: (posts: Post[]) => void,
    order: FeedOrder = 'desc'
  ): Unsubscribe {
    console.log('[PostService] Consultando feed -> orden: createdAt', order.toUpperCase());
    const q = query(collection(db, 'posts'), orderBy('createdAt', order));
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      console.log('[PostService] Recibidos', posts.length, 'posts en el feed');
      callback(posts);
    });
  }

  public subscribeToFollowingFeed(
    followingIds: string[],
    callback: (posts: Post[]) => void,
    order: FeedOrder = 'desc'
  ): Unsubscribe {
    console.log('[PostService] Consultando feed Siguiendo -> total seguidos:', followingIds.length);

    if (followingIds.length === 0) {
      callback([]);
      return () => {};
    }

    const CHUNK_SIZE = 30;
    const chunks: string[][] = [];
    for (let i = 0; i < followingIds.length; i += CHUNK_SIZE) {
      chunks.push(followingIds.slice(i, i + CHUNK_SIZE));
    }

    const postsByChunk: Post[][] = chunks.map(() => []);
    const unsubs: Unsubscribe[] = [];

    chunks.forEach((chunk, index) => {
      const q = query(
        collection(db, 'posts'),
        where('authorId', 'in', chunk),
        orderBy('createdAt', order)
      );
      const unsub = onSnapshot(q, snap => {
        postsByChunk[index] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        const all = postsByChunk.flat().sort((a, b) => {
          const aTime = (a.createdAt as any)?.toMillis?.() || 0;
          const bTime = (b.createdAt as any)?.toMillis?.() || 0;
          return order === 'desc' ? bTime - aTime : aTime - bTime;
        });
        callback(all);
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }

  public subscribeToUserPosts(
    userId: string,
    callback: (posts: Post[]) => void,
    order: FeedOrder = 'desc'
  ): Unsubscribe {
    console.log('[PostService] Consultando posts del usuario -> authorId:', userId);
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', order)
    );
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      console.log('[PostService] Recibidos', posts.length, 'posts del usuario:', userId);
      callback(posts);
    });
  }

  public async toggleLike(postId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');

    const likedBy = post.likedBy || [];
    const alreadyLiked = likedBy.includes(user.uid);

    await updateDoc(doc(db, 'posts', postId), {
      likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likes: increment(alreadyLiked ? -1 : 1),
    });

    if (!alreadyLiked && post.authorId !== user.uid) {
      try {
        const currentProfile = await userService.getById(user.uid);
        if (currentProfile) {
          await notificationService.createNotification({
            recipientId: post.authorId,
            senderId: user.uid,
            senderUsername: currentProfile.username,
            senderPhotoURL: currentProfile.photoURL || '',
            type: 'like',
            postId: postId,
            postPreview: post.content.substring(0, 50),
          });
        }
      } catch (e) {
        console.warn('[PostService] No se pudo crear notificacion de like:', e);
      }
    }

    console.log('[PostService] Like actualizado -> postId:', postId);
  }

  public subscribeToComments(
    postId: string,
    callback: (comments: Comment[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      const comments = snap.docs.map(d => ({ id: d.id, postId, ...d.data() } as Comment));
      callback(comments);
    });
  }

  public async addComment(postId: string, content: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const trimmed = content.trim();
    if (!trimmed) throw new Error('El comentario no puede estar vacío');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      content: trimmed,
      authorId: user.uid,
      authorEmail: user.email,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });

    if (post.authorId !== user.uid) {
      try {
        const currentProfile = await userService.getById(user.uid);
        if (currentProfile) {
          await notificationService.createNotification({
            recipientId: post.authorId,
            senderId: user.uid,
            senderUsername: currentProfile.username,
            senderPhotoURL: currentProfile.photoURL || '',
            type: 'comment',
            postId: postId,
            postPreview: post.content.substring(0, 50),
          });
        }
      } catch (e) {
        console.warn('[PostService] No se pudo crear notificacion de comentario:', e);
      }
    }

    console.log('[PostService] Comentario agregado -> postId:', postId);
  }

  public async deleteComment(postId: string, commentId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (!snap.exists()) throw new Error('Comentario no encontrado');

    const data = snap.data();
    if (data.authorId !== user.uid) throw new Error('No puedes eliminar este comentario');

    await deleteDoc(commentRef);
    await updateDoc(doc(db, 'posts', postId), { comments: increment(-1) });
    console.log('[PostService] Comentario eliminado -> postId:', postId);
  }
}

export const postService = PostService.getInstance();