/*
  Warnings:

  - The `source` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "source",
ADD COLUMN     "source" "IntegrationType" NOT NULL DEFAULT 'TRACKER23';
