import { NextRequest, NextResponse } from 'next/server'
import { getAllReminders, createReminder } from '@/lib/database'

// GET /api/reminders - List reminders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const reminders = await getAllReminders(userId, {
      active,
      type: type || undefined,
      priority: priority || undefined,
      limit,
      offset,
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

// POST /api/reminders - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const data = await request.json()
    
    const reminder = await createReminder({
      userId,
      title: data.title,
      description: data.description,
      expirationDate: new Date(data.expirationDate),
      type: data.type,
      priority: data.priority,
      influencerId: data.influencerId,
      campaignId: data.campaignId,
      metadata: data.metadata,
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
} 