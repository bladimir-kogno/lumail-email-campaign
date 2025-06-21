import { NextRequest, NextResponse } from 'next/server'
import { sendScheduledCampaigns } from '@/lib/email'

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const results = await sendScheduledCampaigns()
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
