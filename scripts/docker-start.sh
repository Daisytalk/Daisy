#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Migrations done."
fi
# Явно пробрасываем DATABASE_URL в процесс Next (на случай особенностей окружения Azure)
export DATABASE_URL
exec node_modules/.bin/next start
