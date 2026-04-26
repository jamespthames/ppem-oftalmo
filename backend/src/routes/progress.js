const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [answers, sessions] = await Promise.all([
      prisma.userAnswer.findMany({
        where: { userId },
        include: { question: { select: { tema: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const total = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;

    const byTopic = {};
    for (const a of answers) {
      const t = a.question.tema;
      if (!byTopic[t]) byTopic[t] = { total: 0, correct: 0 };
      byTopic[t].total++;
      if (a.isCorrect) byTopic[t].correct++;
    }

    const sessionDates = [
      ...new Set(sessions.map((s) => new Date(s.createdAt).toDateString())),
    ].sort();

    let streak = 0;
    if (sessionDates.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const lastDate = sessionDates[sessionDates.length - 1];

      if (lastDate === today || lastDate === yesterday) {
        streak = 1;
        let check = new Date(lastDate);
        for (let i = sessionDates.length - 2; i >= 0; i--) {
          const expected = new Date(check.getTime() - 86400000).toDateString();
          if (sessionDates[i] === expected) {
            streak++;
            check = new Date(expected);
          } else {
            break;
          }
        }
      }
    }

    res.json({
      total,
      correct,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      byTopic,
      streak,
      sessionsCount: sessions.length,
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: { question: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        createdAt: b.createdAt,
        question: {
          id: b.question.id,
          enunciado: b.question.enunciado,
          tema: b.question.tema,
          tipo: b.question.tipo,
          opciones: JSON.parse(b.question.opciones),
          tieneImagen: b.question.tieneImagen,
          hasImage: !!b.question.imagenBase64,
        },
      })),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener marcadores' });
  }
});

router.post('/bookmarks', authenticate, async (req, res) => {
  try {
    const { questionId } = req.body;
    const bookmark = await prisma.bookmark.create({
      data: { userId: req.user.id, questionId },
    });
    res.json({ bookmark });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Ya marcado' });
    res.status(500).json({ error: 'Error al agregar marcador' });
  }
});

router.delete('/bookmarks/:questionId', authenticate, async (req, res) => {
  try {
    await prisma.bookmark.deleteMany({
      where: { userId: req.user.id, questionId: req.params.questionId },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar marcador' });
  }
});

router.get('/bookmarks/:questionId/check', authenticate, async (req, res) => {
  try {
    const bm = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: { userId: req.user.id, questionId: req.params.questionId },
      },
    });
    res.json({ isBookmarked: !!bm });
  } catch {
    res.status(500).json({ error: 'Error al verificar marcador' });
  }
});

module.exports = router;
