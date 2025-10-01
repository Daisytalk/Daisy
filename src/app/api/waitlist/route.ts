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

    // Check if email already exists in waitlist
    const existingEntry = await (prisma as any).waitlist.findFirst({
      where: { email }
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Save to database
    const waitlistEntry = await (prisma as any).waitlist.create({
      data: {
        name,
        preferredName,
        email,
        telegram,
        message,
      },
    })

    console.log('Waitlist submission saved:', {
      id: waitlistEntry.id,
      email: waitlistEntry.email,
      timestamp: waitlistEntry.createdAt
    })

    // Optional: Integrate with Google Forms or other services
    /*
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse'
    const formData = new FormData()
    formData.append('entry.NAME_FIELD_ID', name)
    formData.append('entry.PREFERRED_NAME_FIELD_ID', preferredName)
    formData.append('entry.EMAIL_FIELD_ID', email)
    formData.append('entry.TELEGRAM_FIELD_ID', telegram)
    formData.append('entry.MESSAGE_FIELD_ID', message)

    await fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      body: formData,
    })
    */

    return NextResponse.json(
      { 
        message: 'Successfully submitted to waitlist',
        id: waitlistEntry.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}