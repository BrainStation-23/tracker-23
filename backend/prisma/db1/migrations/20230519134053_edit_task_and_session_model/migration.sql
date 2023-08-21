/*
  Warnings:

  - A unique constraint covering the columns `[id,integratedTaskId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_taskId_fkey";

-- DropIndex
DROP INDEX "Task_integratedTaskId_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "integratedTaskId" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "integratedTaskId" SET DEFAULT -1;

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_integratedTaskId_key" ON "Task"("id", "integratedTaskId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_taskId_integratedTaskId_fkey" FOREIGN KEY ("taskId", "integratedTaskId") REFERENCES "Task"("id", "integratedTaskId") ON DELETE CASCADE ON UPDATE CASCADE;
