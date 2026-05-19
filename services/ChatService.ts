import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Chat, Message } from '../types';
import { userService } from './UserService';

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private buildChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  public async createOrGetChat(targetUid: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');
    if (user.uid === targetUid) throw new Error('No puedes chatear contigo mismo');

    const chatId = this.buildChatId(user.uid, targetUid);
    const chatRef = doc(db, 'chats', chatId);
    const existing = await getDoc(chatRef);

    if (existing.exists()) {
      return chatId;
    }

    const currentUser = await userService.getById(user.uid);
    const targetUser = await userService.getById(targetUid);

    if (!currentUser || !targetUser) {
      throw new Error('No se encontraron los usuarios');
    }

    await setDoc(chatRef, {
      members: [user.uid, targetUid],
      memberNames: {
        [user.uid]: currentUser.username,
        [targetUid]: targetUser.username,
      },
      memberPhotos: {
        [user.uid]: currentUser.photoURL || '',
        [targetUid]: targetUser.photoURL || '',
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastMessageBy: '',
      unreadCount: {
        [user.uid]: 0,
        [targetUid]: 0,
      },
    });

    return chatId;
  }

  public async sendMessage(chatId: string, text: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const trimmed = text.trim();
    if (!trimmed) throw new Error('El mensaje no puede estar vacío');

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) throw new Error('Chat no encontrado');

    const chatData = chatSnap.data() as Chat;
    const otherUid = chatData.members.find(m => m !== user.uid);
    if (!otherUid) throw new Error('Chat inválido');

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: trimmed,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      read: false,
    });

    await updateDoc(chatRef, {
      lastMessage: trimmed,
      lastMessageAt: serverTimestamp(),
      lastMessageBy: user.uid,
      [`unreadCount.${otherUid}`]: increment(1),
    });
  }

  public async deleteMessage(chatId: string, messageId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');

    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) throw new Error('Mensaje no encontrado');

    const data = snap.data();
    if (data.senderId !== user.uid) {
      throw new Error('Solo puedes eliminar tus propios mensajes');
    }

    await deleteDoc(msgRef);
  }

  public subscribeToChats(
    callback: (chats: Chat[]) => void
  ): Unsubscribe {
    const user = auth.currentUser;
    if (!user) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, snap => {
      const chats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
      callback(chats);
    });
  }

  public subscribeToMessages(
    chatId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, snap => {
      const messages = snap.docs.map(d => ({
        id: d.id,
        chatId,
        ...d.data(),
      } as Message));
      callback(messages);
    });
  }

  public async markAsRead(chatId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${user.uid}`]: 0,
    });
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
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid)
    );

    return onSnapshot(q, snap => {
      let total = 0;
      snap.docs.forEach(d => {
        const data = d.data() as Chat;
        total += data.unreadCount?.[user.uid] || 0;
      });
      callback(total);
    });
  }
}

export const chatService = ChatService.getInstance();
