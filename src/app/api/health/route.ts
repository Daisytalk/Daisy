import { NextResponse } from 'next/server'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }

  try {
    const { default: prisma } = await import('@/shared/lib/database')
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
