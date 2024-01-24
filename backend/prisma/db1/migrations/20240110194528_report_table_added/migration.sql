-- In your SQL migration file (e.g., 20240111000000_update_report_table.sql)

-- Create a new column with the correct type
ALTER TABLE "Report" ADD COLUMN "new_config" JSONB;

-- Update the new column with the converted data, handling the array elements individually
UPDATE "Report" SET "new_config" = (
    SELECT jsonb_agg(elem::jsonb) FROM (
        SELECT unnest("config") AS elem FROM "Report"
    ) AS arr
);

-- Drop the old "config" column
ALTER TABLE "Report" DROP COLUMN "config";

-- Rename the new column to "config"
ALTER TABLE "Report" RENAME COLUMN "new_config" TO "config";
