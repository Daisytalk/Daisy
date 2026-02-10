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
        hint: 'Check connection string; if error mentions a column, run: npx prisma migrate deploy',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      nextVersion: '16.0.7',
    },
    { status: 200 }
  );
}
