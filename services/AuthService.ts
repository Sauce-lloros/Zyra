import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { LoginData, RegisterData } from '../types';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  public async register(data: RegisterData): Promise<void> {
    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();

    const usernameSnap = await getDocs(
      query(collection(db, 'users'), where('username', '==', username))
    );
    if (!usernameSnap.empty) {
      throw new Error('Este nombre de usuario ya está en uso');
    }

    const emailSnap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email))
    );
    if (!emailSnap.empty) {
      throw new Error('Este correo ya está registrado');
    }

    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, data.password);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado');
      }
      if (e.code === 'auth/invalid-email') {
        throw new Error('Correo inválido');
      }
      throw new Error('Error al crear cuenta');
    }

    await setDoc(doc(db, 'users', cred.user.uid), {
      username,
      email,
      bio: '',
      photoURL: '',
      createdAt: new Date(),
    });
  }

  public async login(data: LoginData): Promise<void> {
    const identifier = data.identifier.trim();
    let emailToUse = identifier;

    if (!identifier.includes('@')) {
      const snap = await getDocs(
        query(collection(db, 'users'), where('username', '==', identifier))
      );
      if (snap.empty) {
        throw new Error('Usuario no encontrado');
      }
      emailToUse = snap.docs[0].data().email;
    }

    try {
      await signInWithEmailAndPassword(auth, emailToUse, data.password);
    } catch (e: any) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        throw new Error('Contraseña incorrecta');
      }
      if (e.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con ese correo');
      }
      if (e.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Intenta más tarde');
      }
      throw new Error('Credenciales incorrectas');
    }
  }

  public async logout(): Promise<void> {
    await signOut(auth);
  }
}

export const authService = AuthService.getInstance();
