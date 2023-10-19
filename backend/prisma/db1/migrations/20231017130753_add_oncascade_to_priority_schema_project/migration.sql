-- DropForeignKey
ALTER TABLE "PriorityScheme" DROP CONSTRAINT "PriorityScheme_projectId_fkey";

-- AddForeignKey
ALTER TABLE "PriorityScheme" ADD CONSTRAINT "PriorityScheme_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
