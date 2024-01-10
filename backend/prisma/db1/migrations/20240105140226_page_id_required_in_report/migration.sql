/*
  Warnings:

  - Made the column `pageId` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "pageId" SET NOT NULL;
