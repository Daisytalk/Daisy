import { env } from '@/shared/config/env'

export interface EmailMessage {
  to: string
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
}

export interface IEmailService {
  sendEmail(message: EmailMessage): Promise<void>
  addToNewsletter(email: string): Promise<void>
}

export class MailgunEmailService implements IEmailService {
  private mailgun: any
  private mg: any

  constructor() {
    // Only initialize Mailgun on server side
    if (typeof window === 'undefined') {
      this.initializeMailgun()
    }
  }

  private async initializeMailgun() {
    try {
      // Dynamic import to avoid issues with form-data in browser
      const formData = (await import('form-data')).default
      const Mailgun = (await import('mailgun.js')).default

      this.mailgun = new Mailgun(formData)
      this.mg = this.mailgun.client({
        username: 'api',
        key: env.MAILGUN_API_KEY,
      })
    } catch (error) {
      console.error('Failed to initialize Mailgun:', error)
    }
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    if (!this.mg) {
      await this.initializeMailgun()
    }

    if (!this.mg) {
      console.warn('Mailgun not initialized, skipping email send')
      return
    }

    try {
      const messageData = {
        from: `noreply@${env.MAILGUN_DOMAIN}`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        template: message.template,
        'h:X-Mailgun-Variables': message.templateData
          ? JSON.stringify(message.templateData)
          : undefined,
      }

      await this.mg.messages.create(env.MAILGUN_DOMAIN, messageData)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new Error('Failed to send email')
    }
  }

  async addToNewsletter(email: string): Promise<void> {
    if (!this.mg) {
      await this.initializeMailgun()
    }

    if (!this.mg) {
      console.warn('Mailgun not initialized, skipping newsletter signup')
      return
    }

    try {
      // Add to mailing list (you'll need to create this in Mailgun)
      await this.mg.lists.members.createMember(
        `newsletter@${env.MAILGUN_DOMAIN}`,
        {
          address: email,
          subscribed: true,
        }
      )
    } catch (error) {
      console.error('Failed to add to newsletter:', error)
      throw new Error('Failed to add to newsletter')
    }
  }
}

// Mock service for development/testing
export class MockEmailService implements IEmailService {
  async sendEmail(message: EmailMessage): Promise<void> {
    console.log('Mock Email Service - Send Email:', {
      to: message.to,
      subject: message.subject,
      content: message.html || message.text
    })
  }

  async addToNewsletter(email: string): Promise<void> {
    console.log('Mock Email Service - Newsletter Signup:', email)
  }
}