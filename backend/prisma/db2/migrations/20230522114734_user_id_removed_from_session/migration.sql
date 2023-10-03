/*
  Warnings:

  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `ProjectStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectStatus" DROP CONSTRAINT "ProjectStatus_integrationID_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_taskId_integratedTaskId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatusDetail" DROP CONSTRAINT "StatusDetail_projectId_fkey";

-- DropIndex
DROP INDEX "Task_id_integratedTaskId_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId",
ADD COLUMN     "author" TEXT,
ALTER COLUMN "integratedTaskId" DROP NOT NULL,
ALTER COLUMN "integratedTaskId" DROP DEFAULT;

-- DropTable
DROP TABLE "ProjectStatus";

-- CreateTable
CREATE TABLE "Projects" (
    "projectId" TEXT NOT NULL,
    "integrationID" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Projects_projectId_key" ON "Projects"("projectId");

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_integrationID_fkey" FOREIGN KEY ("integrationID") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusDetail" ADD CONSTRAINT "StatusDetail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
