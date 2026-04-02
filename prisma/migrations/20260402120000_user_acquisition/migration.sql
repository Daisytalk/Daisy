-- AlterTable
ALTER TABLE "users" ADD COLUMN "acquisition_source" TEXT;
ALTER TABLE "users" ADD COLUMN "acquisition_detail" TEXT;

-- CreateIndex
CREATE INDEX "users_acquisition_source_idx" ON "users"("acquisition_source");
