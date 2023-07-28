/*
  Warnings:

  - A unique constraint covering the columns `[integrationId,userWorkspaceId]` on the table `UserIntegration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserIntegration_integrationId_userWorkspaceId_key" ON "UserIntegration"("integrationId", "userWorkspaceId");
