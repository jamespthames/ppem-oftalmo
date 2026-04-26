const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/start', authenticate, async (req, res) => {
  try {
    const { temas, count = 10, soloOpcionMultiple = true, questionIds, spacedRepetition = false, timed = false, timeLimitSec } = req.body;

    let allQuestions;
    let sessionTemas;

    if (questionIds && questionIds.length) {
      const where = { id: { in: questionIds }, tipo: 'opcion_multiple' };
      allQuestions = await prisma.question.findMany({ where });
      const temasSet = [...new Set(allQuestions.map(q => q.tema))];
      sessionTemas = temasSet;
    } else {
      if (!temas || !temas.length) {
        return res.status(400).json({ error: 'Selecciona al menos un tema' });
      }
      const where = { tema: { in: temas } };
      if (soloOpcionMultiple) where.tipo = 'opcion_multiple';
      allQuestions = await prisma.question.findMany({ where });
      sessionTemas = temas;
    }

    if (!allQuestions.length) {
      return res.status(400).json({ error: 'No hay preguntas disponibles para esta selección' });
    }

    let selected;
    if (spacedRepetition) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const wrongAnswers = await prisma.userAnswer.findMany({
        where: { userId: req.user.id, isCorrect: false, createdAt: { gte: thirtyDaysAgo } },
        select: { questionId: true },
      });
      const wrongIds = new Set(wrongAnswers.map(a => a.questionId));

      // Build weighted pool: wrong questions appear 3x, others 1x
      const pool = [];
      for (const q of allQuestions) {
        if (wrongIds.has(q.id)) {
          pool.push(q, q, q);
        } else {
          pool.push(q);
        }
      }

      // Randomly sample `count` from weighted pool
      const target = Math.min(Number(count), allQuestions.length);
      const shuffledPool = pool.sort(() => Math.random() - 0.5);
      const seen = new Set();
      selected = [];
      for (const q of shuffledPool) {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          selected.push(q);
          if (selected.length >= target) break;
        }
      }
    } else if (questionIds && questionIds.length) {
      selected = allQuestions.sort(() => Math.random() - 0.5);
    } else {
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(Number(count), shuffled.length));
    }

    if (!selected.length) {
      return res.status(400).json({ error: 'No hay preguntas disponibles para esta selección' });
    }

    const session = await prisma.studySession.create({
      data: {
        userId: req.user.id,
        temas: JSON.stringify(sessionTemas),
        totalQs: selected.length,
        correctQs: 0,
        durationSec: 0,
        timed: !!timed,
        timeLimitSec: timeLimitSec ? parseInt(timeLimitSec) : null,
      },
    });

    const safeQuestions = selected.map((q) => ({
      id: q.id,
      enunciado: q.enunciado,
      opciones: JSON.parse(q.opciones),
      tipo: q.tipo,
      tema: q.tema,
      tieneImagen: q.tieneImagen,
      imagenBase64: q.imagenBase64,
    }));

    res.json({ sessionId: session.id, questions: safeQuestions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.post('/:id/answer', authenticate, async (req, res) => {
  try {
    const { questionId, answerGiven } = req.body;
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ error: 'Pregunta no encontrada' });

    const isCorrect =
      answerGiven.toUpperCase() === question.respuestaCorrecta.toUpperCase();

    await prisma.userAnswer.create({
      data: {
        userId: req.user.id,
        questionId,
        sessionId: req.params.id,
        answerGiven,
        isCorrect,
      },
    });

    res.json({
      isCorrect,
      respuestaCorrecta: question.respuestaCorrecta,
      nota: question.nota,
    });
  } catch {
    res.status(500).json({ error: 'Error al registrar respuesta' });
  }
});

router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { durationSec = 0 } = req.body;
    const answers = await prisma.userAnswer.findMany({
      where: { sessionId: req.params.id, userId: req.user.id },
    });
    const correctQs = answers.filter((a) => a.isCorrect).length;

    const session = await prisma.studySession.update({
      where: { id: req.params.id },
      data: { correctQs, durationSec },
    });
    res.json({ session });
  } catch {
    res.status(500).json({ error: 'Error al completar sesión' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ sessions });
  } catch {
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
});

module.exports = router;
