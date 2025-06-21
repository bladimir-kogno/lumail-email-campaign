import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { 
        listId: params.id,
        active: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email, firstName, lastName } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: {
        email_listId: {
          email,
          listId: params.id
        }
      }
    })

    if (existingSubscriber) {
      if (!existingSubscriber.active) {
        // Reactivate subscriber
        const updatedSubscriber = await prisma.subscriber.update({
          where: { id: existingSubscriber.id },
          data: { 
            active: true,
            firstName: firstName || existingSubscriber.firstName,
            lastName: lastName || existingSubscriber.lastName
          }
        })
        return NextResponse.json(updatedSubscriber)
      } else {
        return NextResponse.json(
          { error: 'Subscriber already exists' },
          { status: 409 }
        )
      }
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        firstName,
        lastName,
        listId: params.id,
      }
    })
    
    return NextResponse.json(subscriber)
  } catch (error) {
    console.error('Error creating subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    )
  }
}
