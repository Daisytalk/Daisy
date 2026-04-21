-- Add daisy_state column to cbt_messages (conversation phase from Python voice contract).
-- Matches Prisma schema: CbtMessage.daisyState String? @map("daisy_state")
ALTER TABLE "cbt_messages" ADD COLUMN IF NOT EXISTS "daisy_state" TEXT;
