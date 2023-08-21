/*
  Warnings:

  - A unique constraint covering the columns `[integratedTaskId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_taskId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Task_integratedTaskId_key" ON "Task"("integratedTaskId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("integratedTaskId") ON DELETE CASCADE ON UPDATE CASCADE;
