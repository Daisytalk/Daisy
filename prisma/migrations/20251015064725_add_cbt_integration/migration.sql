-- CreateTable
CREATE TABLE "public"."cbt_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "persona" TEXT NOT NULL DEFAULT 'active_listener',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cbt_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cbt_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "protocol" TEXT,
    "diagnosis" TEXT[],
    "persona" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cbt_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cbt_conversations_userId_idx" ON "public"."cbt_conversations"("userId");

-- CreateIndex
CREATE INDEX "cbt_conversations_sessionId_idx" ON "public"."cbt_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "cbt_messages_conversationId_idx" ON "public"."cbt_messages"("conversationId");

-- AddForeignKey
ALTER TABLE "public"."cbt_conversations" ADD CONSTRAINT "cbt_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cbt_messages" ADD CONSTRAINT "cbt_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."cbt_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
