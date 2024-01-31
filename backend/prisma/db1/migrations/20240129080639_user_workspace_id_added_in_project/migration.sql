/*
  Warnings:

  - A unique constraint covering the columns `[calendarId,workspaceId,userWorkspaceId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userWorkspaceId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Project_calendarId_workspaceId_userWorkspaceId_key" ON "Project"("calendarId", "workspaceId", "userWorkspaceId");
