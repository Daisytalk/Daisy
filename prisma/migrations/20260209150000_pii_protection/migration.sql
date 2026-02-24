-- PII Protection: isAnonymized, piiDetected on CbtMessage; PiiAuditLog

ALTER TABLE "cbt_messages" ADD COLUMN IF NOT EXISTS "is_anonymized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cbt_messages" ADD COLUMN IF NOT EXISTS "pii_detected" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "pii_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message_id" TEXT,
    "entity_types" TEXT[] NOT NULL,
    "layer" TEXT NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pii_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "pii_audit_logs_user_id_detected_at_idx" ON "pii_audit_logs"("user_id", "detected_at" DESC);
