-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "conversation_memory" JSONB;
