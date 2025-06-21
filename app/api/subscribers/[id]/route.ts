import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subscriber.update({
      where: { id: params.id },
      data: { active: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email, firstName, lastName } = await request.json()
    
    const subscriber = await prisma.subscriber.update({
      where: { id: params.id },
      data: {
        email,
        firstName,
        lastName,
      }
    })
    
    return NextResponse.json(subscriber)
  } catch (error) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    )
  }
}
