/*
  Warnings:

  - Added the required column `expiration_time` to the `TempIntegration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TempIntegration" ADD COLUMN     "expiration_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserIntegration" ADD COLUMN     "expiration_time" TIMESTAMP(3) NOT NULL DEFAULT '2023-10-16 00:00:00 +00:00';
