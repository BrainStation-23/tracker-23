/*
  Warnings:

  - The primary key for the `callSync` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `callSync` table. All the data in the column will be lost.
  - You are about to drop the `TaskIntegration` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `integratedTaskId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaskIntegration" DROP CONSTRAINT "TaskIntegration_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskIntegration" DROP CONSTRAINT "TaskIntegration_userId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "integratedTaskId" INTEGER NOT NULL,
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "callSync" DROP CONSTRAINT "callSync_pkey",
DROP COLUMN "id",
ADD COLUMN     "syncId" SERIAL NOT NULL,
ADD CONSTRAINT "callSync_pkey" PRIMARY KEY ("syncId");

-- DropTable
DROP TABLE "TaskIntegration";
