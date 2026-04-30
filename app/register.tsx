import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../config/firebase';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!username || !email || !password) { setError('Llena todos los campos'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), { username, email, bio: '', createdAt: new Date() });
      router.replace('/home' as any);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Registrarse</h1>
      {error ? <p style={{ color: 'red', marginBottom: 10 }}>{error}</p> : null}
      <input
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e: any) => setUsername(e.target.value)}
        style={{ width: 280, padding: 12, marginBottom: 12, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16 }}
      />
      <input
        placeholder="Correo"
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
        type="email"
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
        onClick={handleRegister}
        disabled={loading}
        style={{ width: 280, padding: 12, backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginBottom: 16 }}
      >
        {loading ? 'Cargando...' : 'Crear cuenta'}
      </button>
      <p style={{ color: '#aaa' }}>¿Ya tienes cuenta?{' '}
        <span style={{ color: '#208c8c', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => router.push('/login' as any)}>
          Iniciar sesión
        </span>
      </p>
    </div>
  );
}