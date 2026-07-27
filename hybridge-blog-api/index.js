// Configura variables de entorno
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// db expone todos los modelos (db.User, db.Post, ...) ademas de sequelize
const db = require('../models');
const sequelize = db.sequelize;

// Routers
const postRoutes = require('./posts');
const authorRoutes = require('./authors');

// Inicializar express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());        // Permite leer JSON en el body (POST / PUT)
app.use(passport.initialize()); // Necesario para que passport funcione

app.get('/', (req, res) => {
  res.send('Bienvenidos a la API de posts con sequelize');
});

// Registrar los enrutadores CRUD
app.use('/api/posts', postRoutes);
app.use('/api/authors', authorRoutes);

// ---------------------------------------------------------------------
// Estrategia Local (login con email + password)
// ---------------------------------------------------------------------
passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado.' });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return done(null, false, { message: 'Contraseña incorrecta.' });
        }

        return done(null, user); // autenticado
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ---------------------------------------------------------------------
// Estrategia JWT (verifica el token en rutas protegidas)
// ---------------------------------------------------------------------
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await db.User.findByPk(payload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Middleware reutilizable para proteger rutas
const requireAuth = passport.authenticate('jwt', { session: false });

// ---------------------------------------------------------------------
// Registro de usuarios
// ---------------------------------------------------------------------
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email y password son requeridos.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password: hash });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------
// Login: devuelve el JWT
// ---------------------------------------------------------------------
app.post(
  '/api/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const payload = { id: req.user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, token_type: 'Bearer', expires_in: 3600 });
  }
);

// ---------------------------------------------------------------------
// Ruta protegida de ejemplo: solo responde con un token valido
// ---------------------------------------------------------------------
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
});

// ---------------------------------------------------------------------
// Verificar la conexion a la base de datos e iniciar el servidor
// ---------------------------------------------------------------------
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida con la base de datos');

    app.listen(PORT, () => {
      console.log(`Servidor está corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('No se pudo conectar con la base de datos: ', error);
  }
}

startServer();