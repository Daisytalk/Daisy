import { NextRequest, NextResponse } from 'next/server';
import { cbtApi } from '@/shared/lib/cbt-api';
import { apiMessages } from '@/shared/api-messages';
import { getVerifiedAuthFromRequest } from '@/shared/lib/server-auth';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const decoded = await getVerifiedAuthFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: apiMessages.invalidToken }, { status: 401 });
    }

    const { tone } = await req.json();

    await cbtApi.setTone({
      user_id: decoded.userId,
      tone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set tone error:', error);
    return NextResponse.json(
      { error: apiMessages.failedToSetTone },
      { status: 500 }
    );
  }
}
