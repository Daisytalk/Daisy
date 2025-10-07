import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/shared/lib/auth'
import prisma from '@/shared/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (token) {
      try {
        const decoded = AuthService.verifyToken(token)
        
        if (decoded && decoded.userId) {
          console.log(`User ${decoded.userId} logged out at ${new Date().toISOString()}`)
          
          await prisma.user.update({
            where: { id: decoded.userId },
            data: { updatedAt: new Date() }
          }).catch(err => {
            console.error('Failed to update user timestamp on logout:', err)
          })
        }
      } catch (tokenError) {
        console.log('Logout attempted with invalid token')
      }
    }

    const response = NextResponse.json({ 
      message: 'Logged out successfully',
      success: true 
    })

    // Delete the auth cookie
    response.cookies.delete('auth_token')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    const response = NextResponse.json(
      { 
        message: 'Logged out successfully',
        success: true 
      },
      { status: 200 }
    )

    // Still delete the cookie even on error
    response.cookies.delete('auth_token')

    return response
  }
}