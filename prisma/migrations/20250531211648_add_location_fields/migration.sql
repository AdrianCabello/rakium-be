/*
  Warnings:

  - Added the required column `city` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
