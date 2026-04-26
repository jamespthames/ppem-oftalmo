const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    res.json({ token: signToken(user.id), user: safeUser(user) });
  } catch {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    res.json({ token: signToken(user.id), user: safeUser(user) });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

module.exports = router;
