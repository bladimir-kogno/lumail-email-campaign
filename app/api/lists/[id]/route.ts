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
        status: 'active'  // Changed from 'active: true' to 'status: "active"'
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const list = await prisma.list.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete all subscribers in the list first
    await prisma.subscriber.deleteMany({
      where: { listId: params.id }
    })

    // Then delete the list
    await prisma.list.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}