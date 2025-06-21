import { NextResponse } from 'next/server'
import { sendScheduledCampaigns } from '@/lib/email'

export async function GET(request: Request) {
  // Verify the request is from a valid source (e.g., cron job)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Optional: Add authentication for your cron job
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendScheduledCampaigns()

    return NextResponse.json({
      success: true,
      message: result.message,
      // If result contains processed campaigns, include them
      ...(result.processed && { processed: result.processed })
    })
  } catch (error) {
    console.error('Error sending scheduled campaigns:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send scheduled campaigns'
    }, { status: 500 })
  }
}