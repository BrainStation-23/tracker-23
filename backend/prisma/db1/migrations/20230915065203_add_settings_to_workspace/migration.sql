/*
  Warnings:

  - You are about to drop the column `userId` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `userWorkspaceId` on the `Settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,workspaceId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workspaceId` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_userWorkspaceId_fkey";

-- DropIndex
DROP INDEX "Settings_id_userWorkspaceId_key";

-- DropIndex
DROP INDEX "Settings_userWorkspaceId_key";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "userId",
DROP COLUMN "userWorkspaceId",
ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_workspaceId_key" ON "Settings"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_workspaceId_key" ON "Settings"("id", "workspaceId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
