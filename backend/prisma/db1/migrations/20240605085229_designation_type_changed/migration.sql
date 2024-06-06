/*
  Warnings:

  - The `designation` column on the `UserWorkspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserWorkspace" DROP COLUMN "designation",
ADD COLUMN     "designation" TEXT;
