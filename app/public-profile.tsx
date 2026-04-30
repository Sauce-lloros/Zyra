import { router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export default function PublicProfile() {
  const { username } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setProfile(snap.docs[0].data());
      } else {
        setError('Usuario no encontrado');
      }
    };
    fetch();
  }, [username]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111', color: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Perfil de {username}</h1>
        {error ? <p style={{ color: 'red', textAlign: 'center' }}>{error}</p> : null}
        {profile ? (
          <div style={{ backgroundColor: '#222', borderRadius: 8, padding: 20 }}>
            <p style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>NOMBRE DE USUARIO</p>
            <p style={{ fontSize: 18, marginBottom: 16 }}>{profile.username}</p>
            <p style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>BIOGRAFÍA</p>
            <p style={{ fontSize: 16 }}>{profile.bio || 'Sin biografía'}</p>
          </div>
        ) : !error ? <p style={{ color: '#aaa' }}>Cargando...</p> : null}
        <button
          onClick={() => router.back()}
          style={{ width: '100%', padding: 12, backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', marginTop: 24 }}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}