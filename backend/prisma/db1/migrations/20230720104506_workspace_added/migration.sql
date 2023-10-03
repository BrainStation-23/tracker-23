/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `jiraAccountId` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Sprint` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SprintTask` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TempIntegration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `callSync` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[siteId,workspaceId]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siteId,id]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sprintId,taskId]` on the table `SprintTask` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siteId,userWorkspaceId]` on the table `TempIntegration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userWorkspaceId` to the `TempIntegration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `TempIntegration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userWorkspaceId` to the `callSync` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserWorkspaceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED', 'DELETED');

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_accountId_fkey";

-- DropForeignKey
ALTER TABLE "UserAccount" DROP CONSTRAINT "UserAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToUser" DROP CONSTRAINT "_AccountToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToUser" DROP CONSTRAINT "_AccountToUser_B_fkey";

-- DropIndex
DROP INDEX "Integration_siteId_userId_key";

-- DropIndex
DROP INDEX "SprintTask_sprintId_taskId_userId_key";

-- DropIndex
DROP INDEX "TempIntegration_siteId_userId_key";

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "accessToken",
DROP COLUMN "jiraAccountId",
DROP COLUMN "refreshToken",
DROP COLUMN "userId",
ADD COLUMN     "workspaceId" INTEGER NOT NULL,
ALTER COLUMN "siteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "userId",
ADD COLUMN     "workspaceId" INTEGER;

-- AlterTable
ALTER TABLE "Sprint" DROP COLUMN "userId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SprintTask" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "userId",
ADD COLUMN     "userWorkspaceId" INTEGER,
ADD COLUMN     "workspaceId" INTEGER;

-- AlterTable
ALTER TABLE "TempIntegration" DROP COLUMN "userId",
ADD COLUMN     "userWorkspaceId" INTEGER NOT NULL,
ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeWorkspaceId" INTEGER;

-- AlterTable
ALTER TABLE "callSync" DROP COLUMN "userId",
ADD COLUMN     "userWorkspaceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "UserAccount";

-- DropTable
DROP TABLE "_AccountToUser";

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorUserId" INTEGER NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWorkspace" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "inviterId" INTEGER,
    "invitationID" TEXT,
    "status" "UserWorkspaceStatus" NOT NULL,

    CONSTRAINT "UserWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserIntegration" (
    "id" SERIAL NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "jiraAccountId" TEXT,
    "userWorkspaceId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "integrationId" INTEGER,
    "siteId" TEXT,

    CONSTRAINT "UserIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_siteId_workspaceId_key" ON "Integration"("siteId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_siteId_id_key" ON "Integration"("siteId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SprintTask_sprintId_taskId_key" ON "SprintTask"("sprintId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TempIntegration_siteId_userWorkspaceId_key" ON "TempIntegration"("siteId", "userWorkspaceId");

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_integrationId_siteId_fkey" FOREIGN KEY ("integrationId", "siteId") REFERENCES "Integration"("id", "siteId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempIntegration" ADD CONSTRAINT "TempIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "callSync" ADD CONSTRAINT "callSync_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
