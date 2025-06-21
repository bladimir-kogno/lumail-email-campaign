import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subscriber.update({
      where: { id: params.id },
      data: { status: 'inactive' }  // Changed from 'status: "inactive"' to 'status: "inactive"'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: params.id },
      include: { list: true }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscriber)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriber' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const subscriber = await prisma.subscriber.update({
      where: { id: params.id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status || 'active'
      }
    })

    return NextResponse.json(subscriber)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    )
  }
}