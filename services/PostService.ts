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
  }

  public async getById(postId: string): Promise<Post | null> {
    const snap = await getDoc(doc(db, 'posts', postId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Post;
  }

  public async update(postId: string, data: UpdatePostData): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');
    if (post.authorId !== user.uid) {
      throw new Error('No puedes editar esta publicación');
    }

    await updateDoc(doc(db, 'posts', postId), {
      content: data.content.trim(),
      imageURLs: data.imageURLs || [],
      editedAt: new Date(),
    });
  }

  public async delete(postId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const post = await this.getById(postId);
    if (!post) throw new Error('Publicación no encontrada');
    if (post.authorId !== user.uid) {
      throw new Error('No puedes eliminar esta publicación');
    }

    await deleteDoc(doc(db, 'posts', postId));
  }

  public subscribeToFeed(callback: (posts: Post[]) => void): Unsubscribe {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      callback(posts);
    });
  }

  public subscribeToUserPosts(
    userId: string,
    callback: (posts: Post[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
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
      const comments = snap.docs.map(d => ({
        id: d.id,
        postId,
        ...d.data(),
      } as Comment));
      callback(comments);
    });
  }

  public async addComment(postId: string, content: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const trimmed = content.trim();
    if (!trimmed) throw new Error('El comentario no puede estar vacío');

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      content: trimmed,
      authorId: user.uid,
      authorEmail: user.email,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'posts', postId), {
      comments: increment(1),
    });
  }

  public async deleteComment(postId: string, commentId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (!snap.exists()) throw new Error('Comentario no encontrado');

    const data = snap.data();
    if (data.authorId !== user.uid) {
      throw new Error('No puedes eliminar este comentario');
    }

    await deleteDoc(commentRef);

    await updateDoc(doc(db, 'posts', postId), {
      comments: increment(-1),
    });
  }
}

export const postService = PostService.getInstance();