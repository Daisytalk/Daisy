#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Migrations done."
fi
exec node_modules/.bin/next start
