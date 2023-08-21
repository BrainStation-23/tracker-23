/*
  Warnings:

  - You are about to drop the column `integrationID` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `invitationID` on the `UserWorkspace` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_integrationID_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "integrationID",
ADD COLUMN     "integrationId" INTEGER;

-- AlterTable
ALTER TABLE "UserWorkspace" DROP COLUMN "invitationID",
ADD COLUMN     "invitationId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
