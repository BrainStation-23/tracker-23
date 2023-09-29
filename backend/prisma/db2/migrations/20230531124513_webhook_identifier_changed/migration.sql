/*
  Warnings:

  - A unique constraint covering the columns `[webhookId,siteUrl]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "webhook_projectKey_webhookId_siteUrl_key";

-- CreateIndex
CREATE UNIQUE INDEX "webhook_webhookId_siteUrl_key" ON "webhook"("webhookId", "siteUrl");
