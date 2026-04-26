const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const entries = await prisma.changelog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });
    res.json({ changelog: entries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener changelog' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const entry = await prisma.changelog.create({
      data: { title, description, type: type || 'feature', userId: req.user.id },
      include: { user: { select: { name: true } } },
    });
    res.json({ entry });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear entrada de changelog' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.changelog.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar entrada de changelog' });
  }
});

module.exports = router;
