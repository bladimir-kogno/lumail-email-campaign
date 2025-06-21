import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        list: {
          include: {
            subscribers: {
              where: { status: 'active' },
            },
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 })
    }

    // Update campaign status to sending
    await prisma.campaign.update({
      where: { id: params.id },
      data: { status: 'sending' },
    })

    let successCount = 0
    let errorCount = 0

    // Send emails to all active subscribers
    for (const subscriber of campaign.list.subscribers) {
      try {
        // Create email record
        const email = await prisma.email.create({
          data: {
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: 'pending',
          },
        })

        // Prepare email content with tracking and unsubscribe
        const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL}/api/track/${email.id}" width="1" height="1" />`
        const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${subscriber.id}`

        let htmlContent = campaign.content
        htmlContent = htmlContent.replace('</body>', `${trackingPixel}</body>`)
        htmlContent += `<p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <a href="${unsubscribeLink}">Unsubscribe</a>
        </p>`

        // Send email
        const result = await sendEmail({
          to: subscriber.email,
          subject: campaign.subject,
          html: htmlContent,
        })

        if (result.success) {
          await prisma.email.update({
            where: { id: email.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          })
          successCount++
        } else {
          await prisma.email.update({
            where: { id: email.id },
            data: {
              status: 'failed',
              error: result.error,
            },
          })
          errorCount++
        }
      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error)
        errorCount++
      }
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Campaign sent successfully',
      successCount,
      errorCount,
      totalCount: campaign.list.subscribers.length,
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 })
  }
}