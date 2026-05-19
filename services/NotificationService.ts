import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Notification } from '../types';

interface CreateNotificationData {
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderPhotoURL: string;
  type: 'follow' | 'like' | 'comment';
  postId?: string;
  postPreview?: string;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async createNotification(data: CreateNotificationData): Promise<void> {
    if (data.recipientId === data.senderId) return;

    console.log('[NotificationService] Creando notificacion ->', data.type, '| para:', data.recipientId);

    await addDoc(collection(db, 'notifications'), {
      recipientId: data.recipientId,
      senderId: data.senderId,
      senderUsername: data.senderUsername,
      senderPhotoURL: data.senderPhotoURL || '',
      type: data.type,
      postId: data.postId || null,
      postPreview: data.postPreview || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  public subscribeToNotifications(
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, snap => {
      const notifications = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Notification));
      console.log('[NotificationService] Recibidas', notifications.length, 'notificaciones');
      callback(notifications);
    });
  }

  public async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  }

  public async markAllAsRead(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(doc(db, 'notifications', d.id), { read: true });
    });
    await batch.commit();
    console.log('[NotificationService] Marcadas', snap.docs.length, 'como leidas');
  }

  public subscribeToUnreadCount(
    callback: (count: number) => void
  ): Unsubscribe {
    const user = auth.currentUser;
    if (!user) {
      callback(0);
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    return onSnapshot(q, snap => {
      callback(snap.docs.length);
    });
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await deleteDoc(doc(db, 'notifications', notificationId));
  }
}

export const notificationService = NotificationService.getInstance();
