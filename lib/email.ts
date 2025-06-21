import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Choose your email service provider
// Option 1: Using Resend (recommended for production)
let resend: Resend | null = null

// Only initialize Resend if we have an API key
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

// Option 2: Using Nodemailer (for development/testing)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, from, replyTo }: EmailOptions) {
  const fromEmail = from || process.env.EMAIL_FROM || 'noreply@example.com'

  // If using Resend
  if (resend && process.env.RESEND_API_KEY) {
    try {
      const data = await resend.emails.send({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo,
      })
      return { success: true, data }
    } catch (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }
  }

  // If using Nodemailer
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      replyTo,
    })
    return { success: true, data: info }
  } catch (error) {
    console.error('Nodemailer error:', error)
    return { success: false, error }
  }
}

// Utility function to send bulk emails with rate limiting
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  htmlTemplate: (email: string) => string,
  options?: {
    batchSize?: number
    delayMs?: number
    from?: string
  }
) {
  const { batchSize = 10, delayMs = 1000, from } = options || {}
  const results = []

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    const batchPromises = batch.map(email =>
      sendEmail({
        to: email,
        subject,
        html: htmlTemplate(email),
        from,
      })
    )

    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)

    // Add delay between batches to avoid rate limits
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

// Function to send scheduled campaigns
export async function sendScheduledCampaigns() {
  try {
    // Import prisma here to avoid circular dependencies
    const { prisma } = await import('@/lib/prisma')

    // Find campaigns that are scheduled and ready to send
    const now = new Date()
    const campaignsToSend = await prisma.campaign.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now
        },
        sentAt: null
      },
      include: {
        list: {
          include: {
            subscribers: {
              where: {
                status: 'active'
              }
            }
          }
        }
      }
    })

    const results = []

    for (const campaign of campaignsToSend) {
      if (!campaign.list || campaign.list.subscribers.length === 0) {
        results.push({
          campaignId: campaign.id,
          status: 'skipped',
          reason: 'No active subscribers'
        })
        continue
      }

      try {
        // Send emails to all subscribers
        const emailPromises = campaign.list.subscribers.map(subscriber =>
          sendEmail({
            to: subscriber.email,
            subject: campaign.subject,
            html: campaign.htmlContent
              .replace(/{{firstName}}/g, subscriber.firstName || '')
              .replace(/{{lastName}}/g, subscriber.lastName || '')
              .replace(/{{email}}/g, subscriber.email)
          })
        )

        await Promise.all(emailPromises)

        // Update campaign status
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        })

        results.push({
          campaignId: campaign.id,
          status: 'sent',
          recipientCount: campaign.list.subscribers.length
        })
      } catch (error) {
        console.error(`Failed to send campaign ${campaign.id}:`, error)
        results.push({
          campaignId: campaign.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      success: true,
      message: `Processed ${campaignsToSend.length} campaigns`,
      processed: results.length,
      results
    }
  } catch (error) {
    console.error('Error in sendScheduledCampaigns:', error)
    return {
      success: false,
      message: 'Failed to process scheduled campaigns',
      processed: 0,
      results: []
    }
  }
}