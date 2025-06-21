import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const lists = await prisma.list.findMany({
      include: {
        _count: {
          select: { subscribers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const list = await prisma.list.create({
      data: {
        name,
        description: description || '',
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
  }
}