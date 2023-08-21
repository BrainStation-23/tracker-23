-- DropForeignKey
ALTER TABLE "UserIntegration" DROP CONSTRAINT "UserIntegration_integrationId_siteId_fkey";

-- AddForeignKey
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_integrationId_siteId_fkey" FOREIGN KEY ("integrationId", "siteId") REFERENCES "Integration"("id", "siteId") ON DELETE CASCADE ON UPDATE CASCADE;
