/*
  Warnings:

  - You are about to drop the column `author` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "author",
ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "integratedTaskId" DROP DEFAULT;
