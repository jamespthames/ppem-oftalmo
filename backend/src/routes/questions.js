const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const toPublic = (q) => ({
  id: q.id,
  examen: q.examen,
  tema: q.tema,
  numero: q.numero,
  tipo: q.tipo,
  enunciado: q.enunciado,
  opciones: JSON.parse(q.opciones),
  tieneImagen: q.tieneImagen,
  hasImage: !!q.imagenBase64,
  nota: q.nota,
  explicacion: q.explicacion || null,
});

router.get('/topics', authenticate, async (req, res) => {
  try {
    const rows = await prisma.question.findMany({
      select: { tema: true },
      distinct: ['tema'],
      orderBy: { tema: 'asc' },
    });
    res.json({ topics: rows.map((r) => r.tema) });
  } catch {
    res.status(500).json({ error: 'Error al obtener temas' });
  }
});

router.get('/exams', authenticate, async (req, res) => {
  try {
    const rows = await prisma.question.findMany({
      select: { examen: true },
      distinct: ['examen'],
      orderBy: { examen: 'asc' },
    });
    res.json({ exams: rows.map((r) => r.examen) });
  } catch {
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { tema, examen, tipo, search, page = 1, limit = 15, hasImage } = req.query;
    const where = {};

    // Support comma-separated multi-values
    if (tema) {
      const temas = tema.split(',').map(s => s.trim()).filter(Boolean);
      where.tema = temas.length === 1 ? temas[0] : { in: temas };
    }
    if (examen) {
      const examenes = examen.split(',').map(s => s.trim()).filter(Boolean);
      where.examen = examenes.length === 1 ? examenes[0] : { in: examenes };
    }
    if (tipo) {
      const tipos = tipo.split(',').map(s => s.trim()).filter(Boolean);
      where.tipo = tipos.length === 1 ? tipos[0] : { in: tipos };
    }
    if (search) where.enunciado = { contains: search };
    if (hasImage === 'true') where.imagenBase64 = { not: null };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ tema: 'asc' }, { numero: 'asc' }],
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      questions: questions.map(toPublic),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener preguntas' });
  }
});

router.get('/:id/image', authenticate, async (req, res) => {
  try {
    const q = await prisma.question.findUnique({
      where: { id: req.params.id },
      select: { imagenBase64: true },
    });
    if (!q) return res.status(404).json({ error: 'No encontrada' });
    res.json({ imagenBase64: q.imagenBase64 });
  } catch {
    res.status(500).json({ error: 'Error al obtener imagen' });
  }
});

router.get('/:id/answer', authenticate, async (req, res) => {
  try {
    const q = await prisma.question.findUnique({
      where: { id: req.params.id },
      select: { respuestaCorrecta: true, nota: true, opciones: true, explicacion: true },
    });
    if (!q) return res.status(404).json({ error: 'No encontrada' });
    res.json({
      respuestaCorrecta: q.respuestaCorrecta,
      nota: q.nota,
      opciones: JSON.parse(q.opciones),
      explicacion: q.explicacion || null,
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener respuesta' });
  }
});

router.post('/:id/report', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    const report = await prisma.questionReport.create({
      data: { userId: req.user.id, questionId: req.params.id, reason },
    });
    res.json({ report });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al reportar pregunta' });
  }
});

router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const comments = await prisma.questionComment.findMany({
      where: { questionId: req.params.id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ comments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await prisma.questionComment.create({
      data: { userId: req.user.id, questionId: req.params.id, text },
      include: { user: { select: { name: true } } },
    });
    res.json({ comment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

module.exports = router;
