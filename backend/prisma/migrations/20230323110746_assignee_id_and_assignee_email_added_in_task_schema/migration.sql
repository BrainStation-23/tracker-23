/*
  Warnings:

  - You are about to drop the column `assignee` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignee",
ADD COLUMN     "assigneeEmail" TEXT,
ADD COLUMN     "assigneeId" TEXT;
