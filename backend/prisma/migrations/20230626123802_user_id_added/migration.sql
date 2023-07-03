/*
  Warnings:

  - You are about to drop the column `projectIds` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "projectIds";

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
