-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_version" TEXT NOT NULL,
    "consent_type" TEXT NOT NULL,
    "locale" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consent_logs_user_id_idx" ON "consent_logs"("user_id");

-- CreateIndex
CREATE INDEX "consent_logs_user_id_consent_type_consent_version_idx" ON "consent_logs"("user_id", "consent_type", "consent_version");

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "memory_items" ADD COLUMN "expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "memory_items_expires_at_idx" ON "memory_items"("expires_at");

-- Backfill expires_at from ttl_days + createdAt
UPDATE "memory_items"
SET "expires_at" = "createdAt" + ("ttl_days" * INTERVAL '1 day')
WHERE "ttl_days" IS NOT NULL AND "expires_at" IS NULL;
