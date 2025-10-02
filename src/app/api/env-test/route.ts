import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing environment variables...')
    
    const allEnvVars = Object.keys(process.env).sort()
    const databaseRelated = allEnvVars.filter(key => 
      key.toLowerCase().includes('database') || 
      key.toLowerCase().includes('db') ||
      key.toLowerCase().includes('postgres') ||
      key.toLowerCase().includes('neon')
    )
    
    return NextResponse.json({
      status: 'success',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? {
          exists: true,
          length: process.env.DATABASE_URL.length,
          starts_with: process.env.DATABASE_URL.substring(0, 20) + '...',
        } : { exists: false },
        total_env_vars: allEnvVars.length,
        database_related_vars: databaseRelated,
        all_vars: allEnvVars.slice(0, 20) // First 20 for debugging
      }
    })
    
  } catch (error) {
    console.error('❌ Environment test error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}