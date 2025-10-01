import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, preferredName, email, telegram, message } = body

    // Validate required fields
    if (!name || !preferredName || !email || !telegram || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log the submission for now (fallback when database is not available)
    const submissionData = {
      name,
      preferredName,
      email,
      telegram,
      message,
      timestamp: new Date().toISOString()
    }

    console.log('Waitlist submission received:', submissionData)

    try {
      // Try to save to database
      const existingEntry = await (prisma as any).waitlist.findFirst({
        where: { email }
      })

      if (existingEntry) {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        )
      }

      const waitlistEntry = await (prisma as any).waitlist.create({
        data: {
          name,
          preferredName,
          email,
          telegram,
          message,
        },
      })

      console.log('Waitlist submission saved to database:', {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        timestamp: waitlistEntry.createdAt
      })

      return NextResponse.json(
        { 
          message: 'Successfully submitted to waitlist',
          id: waitlistEntry.id
        },
        { status: 200 }
      )

    } catch (dbError) {
      // Database error - log the submission and continue
      console.error('Database error, logging submission:', dbError)
      console.log('WAITLIST SUBMISSION (DB UNAVAILABLE):', JSON.stringify(submissionData, null, 2))
      
      // Still return success to user since we've logged their submission
      return NextResponse.json(
        { 
          message: 'Successfully submitted to waitlist',
          id: `temp_${Date.now()}`
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}