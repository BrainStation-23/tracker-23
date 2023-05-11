/*
  Warnings:

  - You are about to drop the column `accountId` on the `Integration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "accountId",
ADD COLUMN     "jiraAccountId" TEXT;

-- CreateTable
CREATE TABLE "TempIntegration" (
    "id" SERIAL NOT NULL,
    "siteId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "site" TEXT,
    "jiraAccountId" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TempIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempIntegration_siteId_userId_key" ON "TempIntegration"("siteId", "userId");
