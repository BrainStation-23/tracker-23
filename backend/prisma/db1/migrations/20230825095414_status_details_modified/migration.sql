-- AlterTable
ALTER TABLE "StatusDetail" ALTER COLUMN "untranslatedName" DROP NOT NULL,
ALTER COLUMN "statusCategoryId" DROP NOT NULL,
ALTER COLUMN "statusId" DROP NOT NULL;
