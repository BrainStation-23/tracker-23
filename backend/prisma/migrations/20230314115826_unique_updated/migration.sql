/*
  Warnings:

  - A unique constraint covering the columns `[type,integratedTaskId,userId]` on the table `TaskIntegration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TaskIntegration` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TaskIntegration_type_integratedTaskId_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TaskIntegration" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TaskIntegration_type_integratedTaskId_userId_key" ON "TaskIntegration"("type", "integratedTaskId", "userId");

-- AddForeignKey
ALTER TABLE "TaskIntegration" ADD CONSTRAINT "TaskIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
