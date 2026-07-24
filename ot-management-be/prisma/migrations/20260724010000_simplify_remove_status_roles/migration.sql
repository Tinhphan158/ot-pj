-- DropForeignKey
ALTER TABLE "overtimes" DROP CONSTRAINT "overtimes_reviewed_by_id_fkey";

-- DropIndex
DROP INDEX "overtimes_status_idx";

-- AlterTable
ALTER TABLE "overtimes" DROP COLUMN "review_note",
DROP COLUMN "reviewed_at",
DROP COLUMN "reviewed_by_id",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "OvertimeStatus";

-- DropEnum
DROP TYPE "Role";
