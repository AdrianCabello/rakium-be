/*
  Warnings:

  - You are about to drop the column `title` on the `Project` table. All the data in the column will be lost.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- Primero añadimos la nueva columna name
ALTER TABLE "Project" ADD COLUMN "name" TEXT;

-- Copiamos los datos de title a name
UPDATE "Project" SET "name" = "title";

-- Hacemos name NOT NULL
ALTER TABLE "Project" ALTER COLUMN "name" SET NOT NULL;

-- Finalmente eliminamos la columna title
ALTER TABLE "Project" DROP COLUMN "title";
