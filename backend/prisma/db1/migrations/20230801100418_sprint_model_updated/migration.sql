/*
  Warnings:

  - You are about to drop the column `userWorkspaceId` on the `Sprint` table. All the data in the column will be lost.
  - You are about to drop the column `userWorkspaceId` on the `SprintTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sprint" DROP COLUMN "userWorkspaceId";

-- AlterTable
ALTER TABLE "SprintTask" DROP COLUMN "userWorkspaceId";
