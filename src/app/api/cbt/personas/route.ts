import { NextResponse } from 'next/server';
import { cbtApi } from '@/shared/lib/cbt-api';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const personas = await cbtApi.getPersonas();
    return NextResponse.json(personas);
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json(
      { error: 'Failed to get personas' },
      { status: 500 }
    );
  }
}
