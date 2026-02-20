-- CreateTable
CREATE TABLE "psych_profile_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ESI" DOUBLE PRECISION NOT NULL,
    "BSI" DOUBLE PRECISION NOT NULL,
    "SSI" DOUBLE PRECISION NOT NULL,
    "PVI" DOUBLE PRECISION NOT NULL,
    "MRI" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "cluster" TEXT,
    "flags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "psych_profile_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "psych_profile_snapshots_userId_idx" ON "psych_profile_snapshots"("userId");

-- AddForeignKey
ALTER TABLE "psych_profile_snapshots" ADD CONSTRAINT "psych_profile_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
