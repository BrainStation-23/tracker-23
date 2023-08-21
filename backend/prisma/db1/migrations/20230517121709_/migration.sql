/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "statusCategoryName" TEXT DEFAULT 'TO_DO',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT DEFAULT 'To Do';
