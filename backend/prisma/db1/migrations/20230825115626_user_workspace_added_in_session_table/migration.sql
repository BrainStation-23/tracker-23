-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "userWorkspaceId" INTEGER;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
