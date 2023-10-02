-- 20230910120001-alter-estimation-column.sql

-- Step 1: Add a new temporary column with the new data type
ALTER TABLE "Task" ADD COLUMN "estimation_temp" REAL;

-- Step 2: Update the temporary column with data from the original column
-- Use a CAST or ::REAL to convert data from the old column to the new data type
UPDATE "Task" SET "estimation_temp" = "estimation"::REAL;

-- Step 3: Drop the original "estimation" column
ALTER TABLE "Task" DROP COLUMN "estimation";

-- Step 4: Rename the temporary column to the original column name
ALTER TABLE "Task" RENAME COLUMN "estimation_temp" TO "estimation";

-- Step 5 (optional): Add constraints or indexes as needed
