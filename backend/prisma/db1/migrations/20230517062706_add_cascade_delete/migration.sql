-- DropForeignKey
ALTER TABLE "ProjectStatus" DROP CONSTRAINT "ProjectStatus_integrationID_fkey";

-- DropForeignKey
ALTER TABLE "StatusDetail" DROP CONSTRAINT "StatusDetail_projectId_fkey";

-- AddForeignKey
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_integrationID_fkey" FOREIGN KEY ("integrationID") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusDetail" ADD CONSTRAINT "StatusDetail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectStatus"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;
