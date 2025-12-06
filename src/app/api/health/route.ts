import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      nextVersion: '16.0.7',
    },
    { status: 200 }
  );
}
