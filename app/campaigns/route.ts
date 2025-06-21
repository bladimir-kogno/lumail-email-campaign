import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCampaign } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, subject, htmlContent, listId, scheduledAt, sendNow } = await request.json()
    
    if (!name || !subject || !htmlContent || !listId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate scheduled time if not sending now
    if (!sendNow && scheduledAt) {
      const scheduledDate = new Date(scheduledAt)
      const now = new Date()
      const minTime = new Date(now.getTime() + 5 * 60000) // 5 minutes from now
      
      if (scheduledDate < minTime) {
        return NextResponse.json(
          { error: 'Scheduled time must be at least 5 minutes in the future' },
          { status: 400 }
        )
      }
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        htmlContent,
        listId,
        status: sendNow ? 'SENT' : scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: sendNow ? new Date() : null,
      },
    })

    // If sending now, send the campaign immediately
    if (sendNow) {
      try {
        await sendCampaign(campaign.id)
      } catch (error) {
        console.error('Error sending campaign:', error)
        // Update campaign status to draft if sending failed
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { 
            status: 'DRAFT',
            sentAt: null 
          }
        })
        return NextResponse.json(
          { error: 'Campaign created but failed to send. You can try sending it again from the campaign page.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
