/*
  Warnings:

  - A unique constraint covering the columns `[fingerprint]` on the table `ApiRequestLimitLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiRequestLimitLog_fingerprint_key" ON "ApiRequestLimitLog"("fingerprint");
