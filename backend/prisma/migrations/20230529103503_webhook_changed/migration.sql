/*
  Warnings:

  - The `projectKey` column on the `webhook` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "webhook" DROP COLUMN "projectKey",
ADD COLUMN     "projectKey" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "webhook_projectKey_webhookId_siteUrl_key" ON "webhook"("projectKey", "webhookId", "siteUrl");
