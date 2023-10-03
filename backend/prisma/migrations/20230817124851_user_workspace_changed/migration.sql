/*
  Warnings:

  - You are about to drop the column `inviterId` on the `UserWorkspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserWorkspace" DROP COLUMN "inviterId",
ADD COLUMN     "inviterUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_inviterUserId_fkey" FOREIGN KEY ("inviterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
