/*
  Warnings:

  - A unique constraint covering the columns `[projectName,source,workspaceId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_projectName_source_workspaceId_key" ON "Project"("projectName", "source", "workspaceId");
