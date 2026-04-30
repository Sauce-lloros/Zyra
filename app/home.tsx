import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

export default function Home() {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUsername(snap.data().username);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/' as any);
  };

  const handleSearch = async () => {
    setSearchError('');
    if (!search) { setSearchError('Escribe un nombre de usuario'); return; }
    const q = query(collection(db, 'users'), where('username', '==', search));
    const snap = await getDocs(q);
    if (snap.empty) { setSearchError('Usuario no encontrado'); return; }
    router.push(`/public-profile?username=${search}` as any);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: 40, color: '#208c8c', marginBottom: 8 }}>Zyra</h1>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>¡Hola, {username || user?.email}!</h2>
      <p style={{ color: '#aaa', marginBottom: 30 }}>{user?.email}</p>

      <div style={{ marginBottom: 30, textAlign: 'center' }}>
        <h3 style={{ marginBottom: 12 }}>Buscar usuario</h3>
        <input
          placeholder="Nombre de usuario"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          style={{ width: 220, padding: 10, borderRadius: 6, border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: 16, marginRight: 8 }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '10px 16px', backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}
        >
          Buscar
        </button>
        {searchError ? <p style={{ color: 'red', marginTop: 8 }}>{searchError}</p> : null}
      </div>

      <button
        onClick={() => router.push('/profile' as any)}
        style={{ width: 280, padding: 12, backgroundColor: '#208c8c', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}
      >
        Ver mi perfil
      </button>
      <button
        onClick={handleLogout}
        style={{ background: 'none', border: 'none', color: 'red', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}