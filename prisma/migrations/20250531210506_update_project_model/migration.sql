/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('ESTACIONES', 'TIENDAS', 'COMERCIALES');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdBy_fkey";

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "image_before" TEXT,
    "image_after" TEXT,
    "location" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "show_on_homepage" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
