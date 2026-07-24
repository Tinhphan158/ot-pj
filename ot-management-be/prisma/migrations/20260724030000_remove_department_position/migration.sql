-- Remove department and position columns from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "department";
ALTER TABLE "users" DROP COLUMN IF EXISTS "position";
