-- Memory Architecture + Premium + Outcome Loop
-- user_preferences, memory_items, conversation_state, premium_offer_logs, stress_ratings, intervention_feedbacks

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "current_stress_rating" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" TEXT DEFAULT 'ru';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" TEXT;

CREATE TABLE IF NOT EXISTS "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferred_styles" JSONB,
    "boundaries" JSONB,
    "goals_top2" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_userId_key" ON "user_preferences"("userId");

CREATE TABLE IF NOT EXISTS "memory_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "valence" INTEGER,
    "intensity" INTEGER,
    "summary" TEXT NOT NULL,
    "evidence" TEXT,
    "confidence" DOUBLE PRECISION,
    "ttl_days" INTEGER,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "consent_scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "memory_items_userId_idx" ON "memory_items"("userId");
CREATE INDEX IF NOT EXISTS "memory_items_userId_topic_idx" ON "memory_items"("userId", "topic");
CREATE INDEX IF NOT EXISTS "memory_items_userId_createdAt_idx" ON "memory_items"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "conversation_state" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "last_session_summary" TEXT,
    "last_session_at" TIMESTAMP(3),
    "rolling_state" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "conversation_state_userId_key" ON "conversation_state"("userId");

CREATE TABLE IF NOT EXISTS "premium_offer_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "offer_shown_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "premium_offer_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "premium_offer_logs_userId_idx" ON "premium_offer_logs"("userId");
CREATE INDEX IF NOT EXISTS "premium_offer_logs_userId_offerShownAt_idx" ON "premium_offer_logs"("userId", "offer_shown_at");

CREATE TABLE IF NOT EXISTS "stress_ratings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stress_ratings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "stress_ratings_userId_idx" ON "stress_ratings"("userId");
CREATE INDEX IF NOT EXISTS "stress_ratings_userId_createdAt_idx" ON "stress_ratings"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "intervention_feedbacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "helped" BOOLEAN,
    "protocol_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intervention_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "intervention_feedbacks_userId_idx" ON "intervention_feedbacks"("userId");

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_state" ADD CONSTRAINT "conversation_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "premium_offer_logs" ADD CONSTRAINT "premium_offer_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stress_ratings" ADD CONSTRAINT "stress_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "intervention_feedbacks" ADD CONSTRAINT "intervention_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
