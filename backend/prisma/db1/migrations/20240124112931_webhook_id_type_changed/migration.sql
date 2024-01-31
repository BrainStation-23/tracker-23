-- Add a new column with the new type
ALTER TABLE "webhook" ADD COLUMN "webhookId_temp" TEXT;

-- Update the data in the new column
UPDATE "webhook" SET "webhookId_temp" = CAST("webhookId" AS TEXT);

-- Drop the original column
ALTER TABLE "webhook" DROP COLUMN "webhookId";

-- Rename the new column to the original name
ALTER TABLE "webhook" RENAME COLUMN "webhookId_temp" TO "webhookId";
