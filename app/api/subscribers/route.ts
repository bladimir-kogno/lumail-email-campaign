import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const listId = searchParams.get('listId')

    const where = listId ? { listId } : {}

    const subscribers = await prisma.subscriber.findMany({
      where,
      include: {
        list: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, listId, status = 'active' } = body

    if (!email || !listId) {
      return NextResponse.json(
        { error: 'Email and listId are required' },
        { status: 400 }
      )
    }

    // Check if subscriber already exists in this list
    const existing = await prisma.subscriber.findFirst({
      where: {
        email,
        listId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subscriber already exists in this list' },
        { status: 400 }
      )
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        listId,
        status,
      },
    })

    return NextResponse.json(subscriber, { status: 201 })
  } catch (error) {
    console.error('Error creating subscriber:', error)
    return NextResponse.json({ error: 'Failed to create subscriber' }, { status: 500 })
  }
}