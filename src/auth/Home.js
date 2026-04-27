import { useEffect } from 'react';

export default function Home({ setScreen }) {

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setScreen('login');
    }
  }, []);

  const obtenerPerfil = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3001/perfil', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        alert('Acceso permitido: ' + data.user.email);
      } else {
        alert(data.error);
      }

    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div>
      <h2>Bienvenido</h2>

      <button onClick={obtenerPerfil}>
        Ver mi perfil
      </button>

      <button onClick={() => {
        localStorage.removeItem('token');
        setScreen('login');
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}