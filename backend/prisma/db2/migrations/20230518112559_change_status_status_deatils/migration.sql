/*
  Warnings:

  - A unique constraint covering the columns `[name,projectId]` on the table `StatusDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "projectId" SET DEFAULT 'None';

-- CreateIndex
CREATE UNIQUE INDEX "StatusDetail_name_projectId_key" ON "StatusDetail"("name", "projectId");
