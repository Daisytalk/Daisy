-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ai_profile" JSONB;
