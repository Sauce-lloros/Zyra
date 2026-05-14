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
    const user = auth.currentUser;
    console.log('[AuthService] getCurrentUser ->', user ? `uid: ${user.uid}` : 'null (no hay sesion activa)');
    return user;
  }

  public async register(data: RegisterData): Promise<void> {
    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();
    console.log('[AuthService] Iniciando registro -> username:', username, '| email:', email);

    console.log('[AuthService] Verificando disponibilidad de username en Firestore...');
    const usernameSnap = await getDocs(
      query(collection(db, 'users'), where('username', '==', username))
    );
    if (!usernameSnap.empty) {
      console.warn('[AuthService] Username ya en uso:', username);
      throw new Error('Este nombre de usuario ya está en uso');
    }
    console.log('[AuthService] Username disponible:', username);

    console.log('[AuthService] Verificando disponibilidad de email en Firestore...');
    const emailSnap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email))
    );
    if (!emailSnap.empty) {
      console.warn('[AuthService] Email ya registrado:', email);
      throw new Error('Este correo ya está registrado');
    }
    console.log('[AuthService] Email disponible:', email);

    console.log('[AuthService] Creando cuenta en Firebase Auth...');
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, data.password);
      console.log('[AuthService] Cuenta creada en Auth -> uid:', cred.user.uid);
    } catch (e: any) {
      console.error('[AuthService] Error en Firebase Auth:', e.code, e.message);
      if (e.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado');
      }
      if (e.code === 'auth/invalid-email') {
        throw new Error('Correo inválido');
      }
      throw new Error('Error al crear cuenta');
    }

    console.log('[AuthService] Guardando perfil en Firestore -> coleccion: users | doc:', cred.user.uid);
    await setDoc(doc(db, 'users', cred.user.uid), {
      username,
      email,
      bio: '',
      photoURL: '',
      createdAt: new Date(),
    });
    console.log('[AuthService] Registro completo -> usuario:', username);
  }

  public async login(data: LoginData): Promise<void> {
    const identifier = data.identifier.trim();
    let emailToUse = identifier;
    console.log('[AuthService] Iniciando sesion -> identificador:', identifier);

    if (!identifier.includes('@')) {
      console.log('[AuthService] Identificador es username, buscando email en Firestore...');
      const snap = await getDocs(
        query(collection(db, 'users'), where('username', '==', identifier))
      );
      if (snap.empty) {
        console.warn('[AuthService] Username no encontrado:', identifier);
        throw new Error('Usuario no encontrado');
      }
      emailToUse = snap.docs[0].data().email;
      console.log('[AuthService] Email resuelto desde username ->', emailToUse);
    }

    console.log('[AuthService] Autenticando con Firebase Auth...');
    try {
      await signInWithEmailAndPassword(auth, emailToUse, data.password);
      console.log('[AuthService] Sesion iniciada correctamente -> email:', emailToUse);
    } catch (e: any) {
      console.error('[AuthService] Error al autenticar:', e.code, e.message);
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
    const user = auth.currentUser;
    console.log('[AuthService] Cerrando sesion -> uid:', user?.uid ?? 'desconocido');
    await signOut(auth);
    console.log('[AuthService] Sesion cerrada correctamente');
  }
}

export const authService = AuthService.getInstance();