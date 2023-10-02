-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "seen" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Projects" ALTER COLUMN "integrationID" DROP NOT NULL;
