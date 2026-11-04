-- DropForeignKey
ALTER TABLE "overtime_audit_logs" DROP CONSTRAINT "overtime_audit_logs_actor_id_fkey";

-- DropTable
DROP TABLE "overtime_audit_logs";

-- DropEnum
DROP TYPE "OvertimeAuditAction";
