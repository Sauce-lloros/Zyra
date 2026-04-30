import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '../config/firebase';

export default function Welcome() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/home' as any);
    });
    return unsub;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Zyra</h1>
      <p style={{ color: '#aaa', marginBottom: 40 }}>Te damos la bienvenida a Zyra</p>
      <button
        onClick={() => router.push('/register' as any)}
        style={{ width: 200, padding: 12, marginBottom: 12, backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}
      >
        Registrarse
      </button>
      <button
        onClick={() => router.push('/login' as any)}
        style={{ width: 200, padding: 12, backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}
      >
        Iniciar sesión
      </button>
    </div>
  );
}