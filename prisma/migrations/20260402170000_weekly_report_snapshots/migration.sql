-- CreateTable
CREATE TABLE "weekly_report_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_report_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_report_snapshots_userId_idx" ON "weekly_report_snapshots"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_report_snapshots_userId_period_key" ON "weekly_report_snapshots"("userId", "period");

-- AddForeignKey
ALTER TABLE "weekly_report_snapshots" ADD CONSTRAINT "weekly_report_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
