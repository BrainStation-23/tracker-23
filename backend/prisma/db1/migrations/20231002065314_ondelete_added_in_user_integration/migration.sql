-- DropForeignKey
ALTER TABLE "UserIntegration" DROP CONSTRAINT "UserIntegration_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
