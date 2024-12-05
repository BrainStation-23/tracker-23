-- AlterTable
ALTER TABLE "StatusDetail" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "spentHours" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoggedIn" TIMESTAMP(3);
