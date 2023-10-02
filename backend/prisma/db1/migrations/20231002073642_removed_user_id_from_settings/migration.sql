/*
  Warnings:

  - You are about to drop the column `userId` on the `Settings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_userId_fkey";

-- DropIndex
DROP INDEX "Settings_id_workspaceId_key";

-- DropIndex
DROP INDEX "Settings_userId_key";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "userId";
