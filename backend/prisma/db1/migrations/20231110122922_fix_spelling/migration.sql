/*
  Warnings:

  - You are about to drop the column `apprroved` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "apprroved",
ADD COLUMN     "approved" BOOLEAN DEFAULT false;
