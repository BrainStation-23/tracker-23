/*
  Warnings:

  - You are about to drop the column `siteUrl` on the `webhook` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[webhookId,siteId]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siteId` to the `webhook` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "webhook_webhookId_siteUrl_key";

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "webhook" DROP COLUMN "siteUrl",
ADD COLUMN     "siteId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webhook_webhookId_siteId_key" ON "webhook"("webhookId", "siteId");
