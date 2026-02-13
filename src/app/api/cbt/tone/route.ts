import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/shared/lib/auth';
import { cbtApi } from '@/shared/lib/cbt-api';
import { apiMessages } from '@/shared/api-messages';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('auth_token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: apiMessages.authorizationRequired }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
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
