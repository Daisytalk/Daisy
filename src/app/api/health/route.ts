import { NextResponse } from 'next/server';

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;

  if (!hasDb) {
    return NextResponse.json(
      {
        status: 'config_error',
        error: 'DATABASE_URL is not set',
        hint: 'Set DATABASE_URL in Azure App Service → Configuration → Application settings',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  let dbError: string | null = null;
  try {
    const { default: prisma } = await import('@/shared/lib/database');
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  if (dbError) {
    return NextResponse.json(
      {
        status: 'db_error',
        error: dbError,
        hint: 'Azure: проверьте DATABASE_URL в Configuration → Application settings; добавьте свой IP в Firewall правила PostgreSQL; миграции выполняются при старте контейнера (scripts/docker-start.sh).',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
