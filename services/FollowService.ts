import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { notificationService } from './NotificationService';
import { userService } from './UserService';

class FollowService {
  private static instance: FollowService;

  private constructor() {}

  public static getInstance(): FollowService {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService();
    }
    return FollowService.instance;
  }

  public async follow(targetUid: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');
    if (user.uid === targetUid) {
      console.warn('[FollowService] Intento de seguirse a si mismo bloqueado -> uid:', user.uid);
      throw new Error('No puedes seguirte a ti mismo');
    }

    console.log('[FollowService] Siguiendo usuario -> currentUid:', user.uid, '| targetUid:', targetUid);

    const followingRef = doc(db, 'users', user.uid, 'following', targetUid);
    const existing = await getDoc(followingRef);
    if (existing.exists()) {
      console.warn('[FollowService] Ya sigues a este usuario -> targetUid:', targetUid);
      return;
    }

    const followerRef = doc(db, 'users', targetUid, 'followers', user.uid);

    await setDoc(followingRef, { createdAt: serverTimestamp() });
    await setDoc(followerRef, { createdAt: serverTimestamp() });

    await updateDoc(doc(db, 'users', user.uid), { followingCount: increment(1) });
    await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(1) });

    console.log('[FollowService] Contadores actualizados (+1) -> currentUid y targetUid');

    try {
      const currentProfile = await userService.getById(user.uid);
      if (currentProfile) {
        await notificationService.createNotification({
          recipientId: targetUid,
          senderId: user.uid,
          senderUsername: currentProfile.username,
          senderPhotoURL: currentProfile.photoURL || '',
          type: 'follow',
        });
        console.log('[FollowService] Notificacion de follow creada -> targetUid:', targetUid);
      }
    } catch (e) {
      console.warn('[FollowService] No se pudo crear notificacion de follow:', e);
    }
  }

  public async unfollow(targetUid: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    console.log('[FollowService] Dejando de seguir -> currentUid:', user.uid, '| targetUid:', targetUid);

    const followingRef = doc(db, 'users', user.uid, 'following', targetUid);
    const existing = await getDoc(followingRef);
    if (!existing.exists()) {
      console.warn('[FollowService] No seguías a este usuario -> targetUid:', targetUid);
      return;
    }

    const followerRef = doc(db, 'users', targetUid, 'followers', user.uid);

    await deleteDoc(followingRef);
    await deleteDoc(followerRef);

    await updateDoc(doc(db, 'users', user.uid), { followingCount: increment(-1) });
    await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(-1) });

    console.log('[FollowService] Contadores actualizados (-1) -> currentUid y targetUid');
  }

  public async isFollowing(targetUid: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    if (user.uid === targetUid) return false;

    console.log('[FollowService] Verificando si sigue -> currentUid:', user.uid, '| targetUid:', targetUid);
    const snap = await getDoc(doc(db, 'users', user.uid, 'following', targetUid));
    const result = snap.exists();
    console.log('[FollowService] Resultado isFollowing:', result);
    return result;
  }

  public subscribeToFollowState(
    targetUid: string,
    callback: (isFollowing: boolean) => void
  ): Unsubscribe {
    const user = auth.currentUser;
    if (!user) {
      callback(false);
      return () => {};
    }

    console.log('[FollowService] Suscribiendo a estado de follow -> targetUid:', targetUid);
    const followingRef = doc(db, 'users', user.uid, 'following', targetUid);
    return onSnapshot(followingRef, snap => {
      const isFollowing = snap.exists();
      console.log('[FollowService] Estado de follow actualizado -> targetUid:', targetUid, '| isFollowing:', isFollowing);
      callback(isFollowing);
    });
  }

  public async getFollowingIds(uid: string): Promise<string[]> {
    console.log('[FollowService] Obteniendo lista de seguidos -> uid:', uid);
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'following'), orderBy('createdAt', 'desc'))
    );
    const ids = snap.docs.map(d => d.id);
    console.log('[FollowService] Seguidos encontrados:', ids.length);
    return ids;
  }

  public async getFollowerIds(uid: string): Promise<string[]> {
    console.log('[FollowService] Obteniendo lista de seguidores -> uid:', uid);
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'followers'), orderBy('createdAt', 'desc'))
    );
    const ids = snap.docs.map(d => d.id);
    console.log('[FollowService] Seguidores encontrados:', ids.length);
    return ids;
  }

  public subscribeToFollowers(
    uid: string,
    callback: (uids: string[]) => void
  ): Unsubscribe {
    console.log('[FollowService] Suscribiendo a seguidores -> uid:', uid);
    const q = query(
      collection(db, 'users', uid, 'followers'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const uids = snap.docs.map(d => d.id);
      console.log('[FollowService] Recibidos', uids.length, 'seguidores -> uid:', uid);
      callback(uids);
    });
  }

  public subscribeToFollowing(
    uid: string,
    callback: (uids: string[]) => void
  ): Unsubscribe {
    console.log('[FollowService] Suscribiendo a seguidos -> uid:', uid);
    const q = query(
      collection(db, 'users', uid, 'following'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const uids = snap.docs.map(d => d.id);
      console.log('[FollowService] Recibidos', uids.length, 'seguidos -> uid:', uid);
      callback(uids);
    });
  }
}

export const followService = FollowService.getInstance();