-- CreateEnum
CREATE TYPE "Designation" AS ENUM ('DEVELOPER', 'MANAGER');

-- AlterTable
ALTER TABLE "UserWorkspace" ADD COLUMN     "designation" "Designation" NOT NULL DEFAULT 'DEVELOPER';
