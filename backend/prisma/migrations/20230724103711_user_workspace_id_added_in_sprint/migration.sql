/*
  Warnings:

  - Added the required column `userWorkspaceId` to the `Sprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "userWorkspaceId" INTEGER NOT NULL;
