-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examen" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "opciones" TEXT NOT NULL,
    "respuestaCorrecta" TEXT NOT NULL,
    "tieneImagen" BOOLEAN NOT NULL DEFAULT false,
    "imagenRef" TEXT,
    "imagenBase64" TEXT,
    "nota" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "temas" TEXT NOT NULL,
    "totalQs" INTEGER NOT NULL,
    "correctQs" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT,
    "answerGiven" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_questionId_key" ON "Bookmark"("userId", "questionId");
