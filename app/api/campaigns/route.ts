// If your /app/api/campaigns/route.ts is importing Resend directly, change it to:

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'  // Use the email lib instead of Resend directly
import { NextResponse } from 'next/server'

// Don't import or initialize Resend directly in your routes
// Use the sendEmail function from lib/email instead

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(campaigns)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlContent: data.content || data.htmlContent || '', // Map content to htmlContent
        status: data.status || 'draft',
        // listId is optional, only add if provided
        ...(data.listId && { listId: data.listId }),
        ...(data.scheduledAt && { scheduledAt: new Date(data.scheduledAt) }),
      }
    })

    // If you need to send emails, use the sendEmail function
    if (data.sendImmediately) {
      await sendEmail({
        to: data.recipients,
        subject: data.subject,
        html: data.content
      })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}