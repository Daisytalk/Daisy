-- AlterTable: add password reset fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_key" ON "users"("password_reset_token");
