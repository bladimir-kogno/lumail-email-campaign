import { Resend } from 'resend'
import { prisma } from './prisma'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      list: {
        include: {
          subscribers: {
            where: { active: true }
          }
        }
      }
    }
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.list.subscribers.length === 0) {
    throw new Error('No active subscribers in the list')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const results = []

  for (const subscriber of campaign.list.subscribers) {
    try {
      // Generate unique tracking ID
      const trackingId = uuidv4()
      
      // Create email log entry
      await prisma.emailLog.create({
        data: {
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          trackingId,
        }
      })

      // Replace placeholders in HTML content
      let personalizedContent = campaign.htmlContent
        .replace(/\{\{firstName\}\}/g, subscriber.firstName || '')
        .replace(/\{\{lastName\}\}/g, subscriber.lastName || '')
        .replace(/\{\{unsubscribeUrl\}\}/g, `${appUrl}/unsubscribe/${subscriber.id}`)

      // Add tracking pixel
      const trackingPixel = `<img src="${appUrl}/api/track/${trackingId}" width="1" height="1" style="display:none;" />`
      
      // Insert tracking pixel before closing body tag or append if no body tag
      if (personalizedContent.includes('</body>')) {
        personalizedContent = personalizedContent.replace('</body>', `${trackingPixel}</body>`)
      } else {
        personalizedContent += trackingPixel
      }

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@example.com', // Use env variable
        to: [subscriber.email],
        subject: campaign.subject,
        html: personalizedContent,
      })

      if (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error)
        results.push({ email: subscriber.email, success: false, error })
      } else {
        // Update email log as sent
        await prisma.emailLog.update({
          where: { trackingId },
          data: { 
            sent: true,
            sentAt: new Date()
          }
        })
        results.push({ email: subscriber.email, success: true, messageId: data?.id })
      }
    } catch (error) {
      console.error(`Error processing email for ${subscriber.email}:`, error)
      results.push({ email: subscriber.email, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Update campaign status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date()
    }
  })

  return results
}

export async function sendScheduledCampaigns() {
  const now = new Date()
  
  const scheduledCampaigns = await prisma.campaign.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        lte: now
      }
    }
  })

  const results = []
  for (const campaign of scheduledCampaigns) {
    try {
      const result = await sendCampaign(campaign.id)
      results.push({ campaignId: campaign.id, success: true, result })
    } catch (error) {
      console.error(`Failed to send scheduled campaign ${campaign.id}:`, error)
      results.push({ campaignId: campaign.id, success: false, error })
    }
  }

  return results
}
