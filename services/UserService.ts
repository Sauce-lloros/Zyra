import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
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
    console.log('[UserService] Consultando usuario por UID -> doc: users/' + uid);
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      console.warn('[UserService] Usuario no encontrado -> uid:', uid);
      return null;
    }
    const user = { uid: snap.id, ...snap.data() } as User;
    console.log('[UserService] Usuario obtenido -> username:', user.username);
    return user;
  }

  public async getByUsername(username: string): Promise<User | null> {
    console.log('[UserService] Buscando usuario por username ->', username);
    const snap = await getDocs(
      query(collection(db, 'users'), where('username', '==', username))
    );
    if (snap.empty) {
      console.warn('[UserService] Usuario no encontrado -> username:', username);
      return null;
    }
    const d = snap.docs[0];
    const user = { uid: d.id, ...d.data() } as User;
    console.log('[UserService] Usuario encontrado -> uid:', user.uid, '| username:', user.username);
    return user;
  }

  public async search(username: string): Promise<User[]> {
    const term = username.trim();
    console.log('[UserService] Busqueda de usuarios -> termino:', term || '(vacio)');
    if (!term) {
      console.log('[UserService] Termino vacio, retornando [] sin consultar Firestore');
      return [];
    }

    const snap = await getDocs(
      query(collection(db, 'users'), where('username', '==', term))
    );
    console.log('[UserService] Busqueda completada ->', snap.docs.length, 'resultado(s) para:', term);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  }

  public async updateProfile(uid: string, updates: UserProfileUpdate): Promise<void> {
    console.log('[UserService] Actualizando perfil -> uid:', uid, '| campos:', Object.keys(updates).join(', '));
    const data: { [key: string]: any } = { ...updates };
    await updateDoc(doc(db, 'users', uid), data);
    console.log('[UserService] Perfil actualizado correctamente -> uid:', uid);
  }

  public async updatePhoto(uid: string, photoURL: string): Promise<void> {
    console.log('[UserService] Actualizando foto de perfil -> uid:', uid, '| URL:', photoURL);
    await this.updateProfile(uid, { photoURL });
    console.log('[UserService] Foto de perfil actualizada -> uid:', uid);
  }

  public subscribeToUser(uid: string, callback: (user: User | null) => void): Unsubscribe {
    console.log('[UserService] Suscribiendo a usuario en tiempo real -> uid:', uid);
    return onSnapshot(doc(db, 'users', uid), snap => {
      if (!snap.exists()) {
        console.warn('[UserService] Usuario no encontrado en suscripcion -> uid:', uid);
        callback(null);
        return;
      }
      const user = { uid: snap.id, ...snap.data() } as User;
      console.log('[UserService] Usuario actualizado en tiempo real -> username:', user.username);
      callback(user);
    });
  }

  public async getByIds(uids: string[]): Promise<User[]> {
    if (uids.length === 0) return [];
    console.log('[UserService] Obteniendo', uids.length, 'usuarios por UIDs');
    const promises = uids.map(uid => this.getById(uid));
    const users = await Promise.all(promises);
    const filtered = users.filter((u): u is User => u !== null);
    console.log('[UserService] Usuarios obtenidos:', filtered.length, 'de', uids.length);
    return filtered;
  }
}

export const userService = UserService.getInstance();