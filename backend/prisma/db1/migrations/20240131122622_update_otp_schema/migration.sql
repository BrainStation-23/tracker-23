/*
  Warnings:

  - You are about to drop the column `firstName` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `OTP` table. All the data in the column will be lost.
  - Made the column `expireTime` on table `OTP` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ALTER COLUMN "expireTime" SET NOT NULL;
