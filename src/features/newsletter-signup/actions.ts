'use server'

import prisma from '@/shared/lib/database'

export async function subscribeToNewsletter(email: string) {
  if (!email) {
    throw new Error('Email is required')
  }

  try {
    await prisma.newsletter.create({
      data: {
        email,
      },
    })
    return { success: true }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    // Check for unique constraint violation
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return { success: false, message: 'This email is already subscribed.' }
    }
    return { success: false, message: 'An unexpected error occurred.' }
  }
}
