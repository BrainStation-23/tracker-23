-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "jiraUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "parentTaskId" INTEGER,
ADD COLUMN     "userWorkspaceId" INTEGER,
ADD COLUMN     "workspaceId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeWorkspaceId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
