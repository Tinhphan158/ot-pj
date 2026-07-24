-- Remove the reason column from overtimes
ALTER TABLE "overtimes" DROP COLUMN IF EXISTS "reason";
