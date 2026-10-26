-- CreateEnum
CREATE TYPE "OvertimeAuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateTable
CREATE TABLE "overtime_audit_logs" (
    "id" TEXT NOT NULL,
    "overtime_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" "OvertimeAuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overtime_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "overtime_audit_logs_overtime_id_idx" ON "overtime_audit_logs"("overtime_id");

-- CreateIndex
CREATE INDEX "overtime_audit_logs_created_at_idx" ON "overtime_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "overtime_audit_logs" ADD CONSTRAINT "overtime_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
