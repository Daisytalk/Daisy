import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Waitlist API called')
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0
    })

    const body = await request.json()
    const { name, preferredName, email, telegram, message } = body

    console.log('📝 Form data received:', { name, preferredName, email, telegram, messageLength: message.length })

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

    console.log('✅ Validation passed, attempting database operation...')

    try {
      console.log('🔍 Initializing Prisma client...')
      
      // Test database connection first
      console.log('🔍 Testing database connection...')
      await prisma.$connect()
      console.log('✅ Database connection successful')

      // Test basic query first
      console.log('🔍 Testing basic waitlist query...')
      const totalCount = await prisma.waitlist.count()
      console.log('✅ Waitlist table accessible, total entries:', totalCount)

      // Check for existing email
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
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        code: (dbError as any)?.code,
        meta: (dbError as any)?.meta,
      })
      
      // Log the full error for debugging
      console.error('❌ Full error object:', dbError)
      
      // Check for specific error types
      if (dbError instanceof Error) {
        if (dbError.message.includes('waitlist')) {
          console.error('🚨 Waitlist table/model issue')
        }
        if (dbError.message.includes('connect')) {
          console.error('🚨 Database connection issue')
        }
        if (dbError.message.includes('timeout')) {
          console.error('🚨 Database timeout issue')
        }
      }
      
      console.log('📝 WAITLIST SUBMISSION (DB ERROR):', JSON.stringify(submissionData, null, 2))
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable. Your submission has been logged.',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          id: `temp_${Date.now()}`,
          saved: false
        },
        { status: 503 }
      )
    } finally {
      // Always disconnect
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}