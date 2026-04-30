import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

export default function Profile() {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setUsername(snap.data().username || '');
          setBio(snap.data().bio || '');
        }
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), { username, bio });
      setMsg('Guardado correctamente');
    } catch (e) {
      setMsg('Error al guardar');
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/' as any);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Mi Perfil</h1>
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>CORREO</p>
        <p style={{ marginBottom: 20 }}>{user?.email}</p>
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>NOMBRE DE USUARIO</p>
        <input
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
          placeholder="Tu nombre de usuario"
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16, boxSizing: 'border-box' }}
        />
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>BIOGRAFÍA</p>
        <textarea
          value={bio}
          onChange={(e: any) => setBio(e.target.value)}
          placeholder="Cuéntanos algo de ti"
          style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16, boxSizing: 'border-box', minHeight: 80 }}
        />
        {msg ? <p style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{msg}</p> : null}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ width: '100%', padding: 12, backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          onClick={() => router.back()}
          style={{ width: '100%', padding: 12, backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}
        >
          ← Volver
        </button>
        <button
          onClick={handleLogout}
          style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: 'red', fontSize: 16, cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}