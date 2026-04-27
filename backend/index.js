const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = 'clave'; 

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.send('Error en conexión');
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Campos obligatorios' });
  }

  try {
    const existe = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuarios (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );

    res.json({ message: 'Registro exitoso' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Campos obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no existe' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login correcto',
      token: token
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

app.get('/perfil', auth, (req, res) => {
  res.json({
    message: 'Acceso permitido',
    user: req.user
  });
});

app.listen(3001, () => {
  console.log('Servidor en http://localhost:3001');
});