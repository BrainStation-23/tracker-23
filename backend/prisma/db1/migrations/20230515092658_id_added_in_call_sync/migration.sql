/*
  Warnings:

  - The primary key for the `callSync` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `syncId` on the `callSync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "callSync" DROP CONSTRAINT "callSync_pkey",
DROP COLUMN "syncId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "callSync_pkey" PRIMARY KEY ("id");
