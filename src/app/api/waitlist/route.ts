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
      console.log('🔍 Attempting to connect to database...')
      
      // Test database connection first
      await prisma.$connect()
      console.log('✅ Database connection successful')

      // Try to save to database
      console.log('🔍 Checking for existing email:', email)
      const existingEntry = await prisma.waitlist.findFirst({
        where: { email }
      })

      if (existingEntry) {
        console.log('❌ Email already exists in waitlist')
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        )
      }

      console.log('🔍 Creating new waitlist entry...')
      const waitlistEntry = await prisma.waitlist.create({
        data: {
          name,
          preferredName,
          email,
          telegram,
          message,
        },
      })

      console.log('✅ Waitlist submission saved to database:', {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        timestamp: waitlistEntry.createdAt
      })

      return NextResponse.json(
        { 
          message: 'Successfully submitted to waitlist',
          id: waitlistEntry.id,
          saved: true
        },
        { status: 200 }
      )

    } catch (dbError) {
      // Database error - provide detailed logging
      console.error('❌ Database error details:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      })
      
      // Check if it's a table/model not found error
      if (dbError instanceof Error && dbError.message.includes('waitlist')) {
        console.error('🚨 Waitlist table/model not found. Run: npx prisma migrate deploy')
      }
      
      console.log('📝 WAITLIST SUBMISSION (DB UNAVAILABLE):', JSON.stringify(submissionData, null, 2))
      
      // Return error instead of success so we know there's an issue
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable. Your submission has been logged.',
          id: `temp_${Date.now()}`,
          saved: false
        },
        { status: 503 }
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