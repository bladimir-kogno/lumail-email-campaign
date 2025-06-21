import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: {
        listId: params.id,
        status: 'active'  // Changed from 'status: "active"' to 'status: "active"'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if subscriber already exists
    const existing = await prisma.subscriber.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subscriber already exists' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        listId: params.id,
        status: 'active'
      }
    })

    return NextResponse.json(subscriber)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    )
  }
}