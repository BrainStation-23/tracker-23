-- CreateTable
CREATE TABLE "webhook" (
    "id" SERIAL NOT NULL,
    "projectKey" TEXT NOT NULL,
    "webhookId" INTEGER NOT NULL,
    "siteUrl" TEXT NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_projectKey_webhookId_siteUrl_key" ON "webhook"("projectKey", "webhookId", "siteUrl");
