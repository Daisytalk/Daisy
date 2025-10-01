import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test if waitlist table exists and can be queried
    try {
      const count = await prisma.waitlist.count()
      console.log('✅ Waitlist table accessible, entries:', count)
      
      // Get a sample entry if any exist
      const sample = await prisma.waitlist.findFirst()
      
      return NextResponse.json({
        status: 'success',
        database: 'connected',
        waitlistTable: 'accessible',
        entryCount: count,
        sampleEntry: sample ? {
          id: sample.id,
          email: sample.email,
          createdAt: sample.createdAt
        } : null
      })
      
    } catch (tableError) {
      console.error('❌ Waitlist table error:', tableError)
      
      return NextResponse.json({
        status: 'error',
        database: 'connected',
        waitlistTable: 'not_accessible',
        error: tableError instanceof Error ? tableError.message : 'Unknown table error',
        suggestion: 'Run: npx prisma migrate deploy'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown connection error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}