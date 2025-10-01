import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest) {
  try {
    // In a production environment, you should add proper authentication here
    // For now, this is a simple endpoint to view waitlist entries
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      (prisma as any).waitlist.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).waitlist.count()
    ])

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching waitlist entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export individual entry by ID
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const entry = await (prisma as any).waitlist.findUnique({
      where: { id }
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error fetching waitlist entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}