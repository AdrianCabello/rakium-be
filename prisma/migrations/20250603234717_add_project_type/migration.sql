/*
  Warnings:

  - Added the required column `type` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- Primero añadimos la columna type con un valor por defecto
ALTER TABLE "Project" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'LANDING';

-- Eliminamos el valor por defecto después de que todos los registros tengan un valor
ALTER TABLE "Project" ALTER COLUMN "type" DROP DEFAULT;
