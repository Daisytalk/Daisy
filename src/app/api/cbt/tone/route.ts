import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/shared/lib/auth';
import { cbtApi } from '@/shared/lib/cbt-api';

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
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
      { error: 'Failed to set tone' },
      { status: 500 }
    );
  }
}
