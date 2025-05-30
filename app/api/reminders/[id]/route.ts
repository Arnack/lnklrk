import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reminders } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

// GET /api/reminders/[id] - Get a specific reminder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || '';
    const reminderId = params.id

    const reminder = await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        )
      )
      .limit(1)

    if (!reminder.length) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ reminder: reminder[0] })

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
    const userId = request.headers.get('x-user-id') || '';
    const reminderId = params.id
    const body = await request.json()

    // Verify ownership
    const existingReminder = await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        )
      )
      .limit(1)

    if (!existingReminder.length) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.expirationDate !== undefined) {
      const expiry = new Date(body.expirationDate)
      if (expiry <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        )
      }
      updateData.expirationDate = expiry
    }
    if (body.type !== undefined) updateData.type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.isCompleted !== undefined) updateData.isCompleted = body.isCompleted
    if (body.isExpired !== undefined) updateData.isExpired = body.isExpired
    if (body.influencerId !== undefined) updateData.influencerId = body.influencerId
    if (body.campaignId !== undefined) updateData.campaignId = body.campaignId
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    updateData.updatedAt = new Date()

    // Update reminder
    const updatedReminder = await db
      .update(reminders)
      .set(updateData)
      .where(
        and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        )
      )
      .returning()

    return NextResponse.json({
      reminder: updatedReminder[0],
      message: 'Reminder updated successfully'
    })

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
    const userId = request.headers.get('x-user-id') || '';
    const reminderId = params.id

    // Verify ownership and delete
    const deletedReminder = await db
      .delete(reminders)
      .where(
        and(
          eq(reminders.id, reminderId),
          eq(reminders.userId, userId)
        )
      )
      .returning()

    if (!deletedReminder.length) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Reminder deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
} 