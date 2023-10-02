/*
  Warnings:

  - You are about to alter the column `estimation` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "estimation" SET DATA TYPE DECIMAL(5,2);
