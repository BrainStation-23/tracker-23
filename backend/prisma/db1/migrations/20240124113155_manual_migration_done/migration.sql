/*
  Warnings:

  - A unique constraint covering the columns `[webhookId,siteId]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.
  - Made the column `webhookId` on table `webhook` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "webhook" ALTER COLUMN "webhookId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webhook_webhookId_siteId_key" ON "webhook"("webhookId", "siteId");
