-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONBOARD', 'ACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboadingSteps" JSONB[],
ADD COLUMN     "status" "UserStatus";
