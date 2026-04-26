const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, '../../data');
  const questionsPath = path.join(dataDir, 'questions_db.json');
  const imagesPath = path.join(dataDir, 'images_db.json');

  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  const images = JSON.parse(fs.readFileSync(imagesPath, 'utf-8'));

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ppem.ucr.ac.cr' },
    update: {},
    create: {
      name: 'Administrador PPEM',
      email: 'admin@ppem.ucr.ac.cr',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✓ Admin user created (admin@ppem.ucr.ac.cr / admin123)');

  await prisma.question.deleteMany({});

  let count = 0;
  for (const q of questions) {
    const imageBase64 = q.imagen_ref && images[q.imagen_ref] ? images[q.imagen_ref] : null;

    await prisma.question.create({
      data: {
        examen: q.examen,
        tema: q.tema,
        numero: Number(q.numero),
        tipo: q.tipo,
        enunciado: q.enunciado,
        opciones: JSON.stringify(q.opciones),
        respuestaCorrecta: String(q.respuesta_correcta),
        tieneImagen: Boolean(q.tiene_imagen),
        imagenRef: q.imagen_ref || null,
        imagenBase64: imageBase64 || null,
        nota: q.nota || null,
      },
    });
    count++;
  }

  console.log(`✓ ${count} questions inserted`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
