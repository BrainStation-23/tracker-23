/*
  Warnings:

  - You are about to drop the column `projectsId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectsId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectsId",
ADD COLUMN     "projectId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
