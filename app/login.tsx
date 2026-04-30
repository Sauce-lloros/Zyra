import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../config/firebase';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!identifier || !password) { setError('Llena todos los campos'); return; }
    setLoading(true);
    try {
      let emailToUse = identifier;
      if (!identifier.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', identifier));
        const snap = await getDocs(q);
        if (snap.empty) { setError('Usuario no encontrado'); setLoading(false); return; }
        emailToUse = snap.docs[0].data().email;
      }
      await signInWithEmailAndPassword(auth, emailToUse, password);
      router.replace('/home' as any);
    } catch (e: any) {
      setError('Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Iniciar sesión</h1>
      <p style={{ color: '#aaa', marginBottom: 24 }}>Bienvenido de vuelta</p>
      {error ? <p style={{ color: 'red', marginBottom: 10 }}>{error}</p> : null}
      <input
        placeholder="Correo o nombre de usuario"
        value={identifier}
        onChange={(e: any) => setIdentifier(e.target.value)}
        style={{ width: 280, padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16 }}
      />
      <input
        placeholder="Contraseña"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
        type="password"
        style={{ width: 280, padding: 12, marginBottom: 20, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16 }}
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: 280, padding: 12, backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginBottom: 16 }}
      >
        {loading ? 'Cargando...' : 'Ingresar'}
      </button>
      <p style={{ color: '#aaa' }}>¿No tienes cuenta?{' '}
        <span style={{ color: '#208c8c', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => router.push('/register' as any)}>
          Regístrate
        </span>
      </p>
    </div>
  );
}