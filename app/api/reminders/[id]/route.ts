import { NextRequest, NextResponse } from 'next/server'
import { getReminderById, updateReminder, deleteReminder } from '@/lib/database'

// GET /api/reminders/[id] - Get a specific reminder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const reminder = await getReminderById(params.id, userId)
    
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error fetching reminder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder' },
      { status: 500 }
    )
  }
}

// PATCH /api/reminders/[id] - Update a specific reminder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const data = await request.json()

    const updatedReminder = await updateReminder(params.id, userId, {
      title: data.title,
      description: data.description,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      type: data.type,
      priority: data.priority,
      isCompleted: data?.isCompleted,
      isExpired: data?.isExpired,
      influencerId: data.influencerId,
      campaignId: data.campaignId,
      metadata: data.metadata,
    })

    if (!updatedReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json({ reminder: updatedReminder })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

// DELETE /api/reminders/[id] - Delete a specific reminder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    const deleted = await deleteReminder(params.id, userId)

    if (!deleted) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Reminder deleted successfully' })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
} 