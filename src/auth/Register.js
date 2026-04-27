import { useState } from 'react';

export default function Register({ setScreen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleRegister = async () => {
  if (!email || !password) {
    alert('Todos los campos son obligatorios');
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Registro exitoso');
      setScreen('login');
    } else {
      alert(data.error);
    }

  } catch (error) {
    alert('Error de conexión');
  }
};

  return (
    <div>
      <h2>Registro</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleRegister}>Registrarse</button>

      <br />

      <button onClick={() => setScreen('login')}>
        Volver al login
      </button>
    </div>
  );
}