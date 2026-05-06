import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserProfileUpdate } from '../types';

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getById(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as User;
  }

  public async getByUsername(username: string): Promise<User | null> {
    const snap = await getDocs(
      query(collection(db, 'users'), where('username', '==', username))
    );
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { uid: doc.id, ...doc.data() } as User;
  }

  public async search(username: string): Promise<User[]> {
    const term = username.trim();
    if (!term) return [];

    const snap = await getDocs(
      query(collection(db, 'users'), where('username', '==', term))
    );
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  }

  public async updateProfile(uid: string, updates: UserProfileUpdate): Promise<void> {
    const data: { [key: string]: any } = { ...updates };
    await updateDoc(doc(db, 'users', uid), data);
  }

  public async updatePhoto(uid: string, photoURL: string): Promise<void> {
    await this.updateProfile(uid, { photoURL });
  }
}

export const userService = UserService.getInstance();