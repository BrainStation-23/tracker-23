/*
  Warnings:

  - A unique constraint covering the columns `[jiraSprintId,projectId]` on the table `Sprint` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "sprintId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_jiraSprintId_projectId_key" ON "Sprint"("jiraSprintId", "projectId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
