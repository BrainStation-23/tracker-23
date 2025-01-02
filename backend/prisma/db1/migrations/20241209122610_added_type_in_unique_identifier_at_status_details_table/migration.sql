/*
  Warnings:

  - A unique constraint covering the columns `[name,type,projectId]` on the table `StatusDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StatusDetail_name_projectId_key";

-- AlterTable
ALTER TABLE "StatusDetail" ALTER COLUMN "type" SET DEFAULT 'Task';

-- CreateIndex
CREATE UNIQUE INDEX "StatusDetail_name_type_projectId_key" ON "StatusDetail"("name", "type", "projectId");
