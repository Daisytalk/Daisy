-- Bilingual weekly snapshot: summary_i18n + structured insights/recommendations/dynamics_metric_insights
ALTER TABLE "weekly_report_snapshots" ADD COLUMN IF NOT EXISTS "summary_i18n" JSONB;
