/*
  Warnings:

  - Added the required column `userWorkspaceId` to the `SprintTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SprintTask" ADD COLUMN     "userWorkspaceId" INTEGER NOT NULL;
