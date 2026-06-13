const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [totalQ, totalUsers, answers] = await Promise.all([
      prisma.question.count(),
      prisma.user.count(),
      prisma.userAnswer.findMany({
        include: { question: { select: { tema: true, enunciado: true, id: true } } },
      }),
    ]);

    const questionStats = {};
    const topicStats = {};

    for (const a of answers) {
      const { id, enunciado, tema } = a.question;

      if (!questionStats[id]) {
        questionStats[id] = {
          enunciado: enunciado.substring(0, 80) + (enunciado.length > 80 ? '...' : ''),
          tema,
          total: 0,
          wrong: 0,
        };
      }
      questionStats[id].total++;
      if (!a.isCorrect) questionStats[id].wrong++;

      if (!topicStats[tema]) topicStats[tema] = { total: 0, wrong: 0 };
      topicStats[tema].total++;
      if (!a.isCorrect) topicStats[tema].wrong++;
    }

    const hardestQuestions = Object.entries(questionStats)
      .filter(([, s]) => s.total >= 3)
      .map(([id, s]) => ({ id, ...s, errorRate: Math.round((s.wrong / s.total) * 100) }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);

    const weakTopics = Object.entries(topicStats)
      .map(([tema, s]) => ({
        tema,
        ...s,
        errorRate: s.total ? Math.round((s.wrong / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.errorRate - a.errorRate);

    res.json({ totalQ, totalUsers, hardestQuestions, weakTopics });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/questions', async (req, res) => {
  try {
    const { tema, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (tema) where.tema = tema;
    if (search) where.enunciado = { contains: search, mode: 'insensitive' };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: [{ tema: 'asc' }, { numero: 'asc' }],
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      questions: questions.map((q) => ({ ...q, opciones: JSON.parse(q.opciones) })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { examen, tema, numero, tipo, enunciado, opciones, respuestaCorrecta, tieneImagen, imagenRef, imagenBase64, nota, explicacion } = req.body;
    const question = await prisma.question.create({
      data: {
        examen, tema, numero: parseInt(numero), tipo, enunciado,
        opciones: JSON.stringify(opciones || {}),
        respuestaCorrecta: respuestaCorrecta || '',
        tieneImagen: !!tieneImagen,
        imagenRef: imagenRef || null,
        imagenBase64: imagenBase64 || null,
        nota: nota || null,
        explicacion: explicacion || null,
      },
    });
    res.json({ question: { ...question, opciones: JSON.parse(question.opciones) } });
  } catch (err) {
    console.error('[CREATE QUESTION ERROR]', err);
    res.status(500).json({ error: 'Error al crear pregunta' });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const { examen, tema, numero, tipo, enunciado, opciones, respuestaCorrecta, tieneImagen, imagenRef, imagenBase64, nota, explicacion } = req.body;
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: {
        examen, tema, numero: parseInt(numero), tipo, enunciado,
        opciones: JSON.stringify(opciones || {}),
        respuestaCorrecta: respuestaCorrecta || '',
        tieneImagen: !!tieneImagen,
        imagenRef: imagenRef || null,
        imagenBase64: imagenBase64 || null,
        nota: nota || null,
        explicacion: explicacion || null,
      },
    });
    res.json({ question: { ...question, opciones: JSON.parse(question.opciones) } });
  } catch (err) {
    console.error('[UPDATE QUESTION ERROR]', err);
    res.status(500).json({ error: 'Error al actualizar pregunta' });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    await prisma.userAnswer.deleteMany({ where: { questionId: req.params.id } });
    await prisma.bookmark.deleteMany({ where: { questionId: req.params.id } });
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar pregunta' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ users });
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, correo y contraseña requeridos' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'El correo ya está registrado' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role === 'admin' ? 'admin' : 'student' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    await prisma.userAnswer.deleteMany({ where: { userId: id } });
    await prisma.bookmark.deleteMany({ where: { userId: id } });
    await prisma.studySession.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'student'].includes(role)) return res.status(400).json({ error: 'Rol inválido' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { questions, images } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Se esperaba un array de preguntas' });
    }

    let imported = 0;
    for (const q of questions) {
      const imageBase64 = images && q.imagen_ref ? images[q.imagen_ref] : null;
      await prisma.question.create({
        data: {
          examen: q.examen,
          tema: q.tema,
          numero: parseInt(q.numero),
          tipo: q.tipo,
          enunciado: q.enunciado,
          opciones: JSON.stringify(q.opciones || {}),
          respuestaCorrecta: String(q.respuesta_correcta || ''),
          tieneImagen: Boolean(q.tiene_imagen),
          imagenRef: q.imagen_ref || null,
          imagenBase64: imageBase64 || null,
          nota: q.nota || null,
        },
      });
      imported++;
    }
    res.json({ imported });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al importar preguntas' });
  }
});

router.get('/questions/:id', async (req, res) => {
  try {
    const q = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!q) return res.status(404).json({ error: 'No encontrada' });
    res.json({ question: { ...q, opciones: JSON.parse(q.opciones) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener pregunta' });
  }
});

router.get('/questions/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.questionComment.findMany({
      where: { questionId: req.params.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ comments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener comentarios de la pregunta' });
  }
});

router.get('/comments', async (req, res) => {
  try {
    const comments = await prisma.questionComment.findMany({
      include: {
        question: { select: { id: true, enunciado: true, tema: true, examen: true, numero: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ comments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

router.delete('/comments/:id', async (req, res) => {
  try {
    await prisma.questionComment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.questionReport.findMany({
      where: { resolved: false },
      include: {
        question: { select: { enunciado: true, tema: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reports });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

router.patch('/reports/:id/resolve', async (req, res) => {
  try {
    const report = await prisma.questionReport.update({
      where: { id: req.params.id },
      data: { resolved: true },
    });
    res.json({ report });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al resolver reporte' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    await prisma.questionReport.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
});

module.exports = router;
