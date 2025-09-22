import { prisma } from '@/shared/lib/database'
import { container, TOKENS } from '@/shared/lib/di'
import type { IEmailService } from '@/shared/services/email'

export async function subscribeToNewsletter(email: string): Promise<void> {
  // Save to database
  await prisma.newsletter.create({
    data: { email },
  })

  // Add to email service
  const emailService = container.get<IEmailService>(TOKENS.EMAIL_SERVICE)
  await emailService.addToNewsletter(email)

  // Send welcome email
  await emailService.sendEmail({
    to: email,
    subject: 'Welcome to our newsletter!',
    html: `
      <h1>Welcome!</h1>
      <p>Thanks for subscribing to our newsletter. We'll keep you updated with our latest news and features.</p>
    `,
  })
}