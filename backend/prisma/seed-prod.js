const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const questionCount = await prisma.question.count();

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('Apptest1!', 12);
    await prisma.user.create({
      data: {
        name: 'James Thames',
        email: 'jamesthameslent@gmail.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Admin user created: jamesthameslent@gmail.com');
  } else {
    console.log('Users already exist, skipping admin creation');
  }

  if (questionCount === 0) {
    const exportPath = path.join(__dirname, '../../data/all_questions_export.json');
    if (!fs.existsSync(exportPath)) {
      console.log('No questions export found, skipping question seed');
      return;
    }

    const questions = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    let inserted = 0;
    const BATCH = 50;

    for (let i = 0; i < questions.length; i += BATCH) {
      const batch = questions.slice(i, i + BATCH);
      await prisma.question.createMany({
        data: batch.map(q => ({
          examen: q.examen,
          tema: q.tema,
          numero: parseInt(q.numero) || 0,
          tipo: q.tipo,
          enunciado: q.enunciado,
          opciones: typeof q.opciones === 'string' ? q.opciones : JSON.stringify(q.opciones || {}),
          respuestaCorrecta: String(q.respuestaCorrecta || ''),
          tieneImagen: Boolean(q.tieneImagen),
          imagenRef: q.imagenRef || null,
          imagenBase64: q.imagenBase64 || null,
          nota: q.nota || null,
        })),
        skipDuplicates: true,
      });
      inserted += batch.length;
      process.stdout.write(`\rSeeding questions: ${inserted}/${questions.length}`);
    }
    console.log(`\n${inserted} questions seeded`);
  } else {
    console.log(`${questionCount} questions already in DB, skipping question seed`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
