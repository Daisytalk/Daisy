#!/bin/sh
set -e

run_migrations() {
  echo "Running database migrations..."
  if npx prisma migrate deploy; then
    echo "Migrations done."
    return 0
  fi

  echo "Migration deploy failed; attempting to clear failed migration record..."
  # Stuck failed row from 2026-06-22 deploy — try rolled-back first (clean retry), then applied (partial DDL).
  npx prisma migrate resolve --rolled-back "20260619120000_gdpr_consent_memory_expires" 2>/dev/null || true
  if npx prisma migrate deploy; then
    echo "Migrations done after rolled-back resolve."
    return 0
  fi

  echo "Retrying with --applied in case schema changes already exist..."
  npx prisma migrate resolve --applied "20260619120000_gdpr_consent_memory_expires" 2>/dev/null || true
  npx prisma migrate deploy
  echo "Migrations done after applied resolve."
}

if [ -n "$DATABASE_URL" ]; then
  run_migrations
fi

export DATABASE_URL
exec node_modules/.bin/next start
