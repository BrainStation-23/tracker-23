/*
  Warnings:

  - Made the column `config` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "config" SET NOT NULL;
