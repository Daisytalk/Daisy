import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'

// Mock database - replace with your actual database
// This should be the same users array from register route
const users = [
  // Mock user for testing - completed onboarding
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // 'password'
    isOnboarded: true,
    subscriptionStatus: 'trial' as const,
    trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Additional test user for admin access
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // 'password'
    isOnboarded: true,
    subscriptionStatus: 'active' as const,
    trialEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password - for development, allow both plain text and hashed passwords
    let isValidPassword = false
    
    // For development: allow plain text password "password" for admin@example.com
    if (user.email === 'admin@example.com' && password === 'password') {
      isValidPassword = true
    } else if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isValidPassword = await AuthService.comparePassword(password, user.password)
    } else {
      // For development: allow plain text password comparison
      isValidPassword = password === user.password
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = AuthService.generateToken(user)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isOnboarded: user.isOnboarded,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}