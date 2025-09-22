import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import type { User } from '@/shared/types/auth'

// Mock database - replace with your actual database
const users: User[] = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create user
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      isOnboarded: false,
      subscriptionStatus: 'trial',
      trialEndsAt: AuthService.generateTrialEndDate(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Store user (in real app, save to database)
    users.push(user)

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
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}