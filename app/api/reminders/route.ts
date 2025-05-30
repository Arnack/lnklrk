import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reminders, users } from '@/lib/schema'
import { eq, and, or, desc, asc, gte, lte, sql, count } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

// GET /api/reminders - List reminders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || '';
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const active = searchParams.get('active') === 'true'
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const sortBy = searchParams.get('sortBy') || 'expirationDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const search = searchParams.get('search')

    let whereConditions = [eq(reminders.userId, userId)]

    // Filter by active status
    if (active) {
      whereConditions.push(
        and(
          eq(reminders.isCompleted, false),
          eq(reminders.isExpired, false)
        )!
      )
    }

    // Filter by type
    if (type) {
      whereConditions.push(eq(reminders.type, type))
    }

    // Filter by priority
    if (priority) {
      whereConditions.push(eq(reminders.priority, priority))
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Build order clause
    const orderColumn = sortBy === 'createdAt' ? reminders.createdAt : 
                       sortBy === 'title' ? reminders.title :
                       reminders.expirationDate
    const orderDirection = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn)

    // Execute query
    const reminderList = await db
      .select()
      .from(reminders)
      .where(and(...whereConditions))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(reminders)
      .where(and(...whereConditions))

    return NextResponse.json({
      reminders: reminderList,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    })

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
    const userId = request.headers.get('x-user-id') || '';
    const body = await request.json()

    const {
      title,
      description,
      expirationDate,
      type = 'general',
      priority = 'medium',
      influencerId,
      campaignId,
      metadata
    } = body

    // Validate required fields
    if (!title || !expirationDate) {
      return NextResponse.json(
        { error: 'Title and expiration date are required' },
        { status: 400 }
      )
    }

    // Validate expiration date is in the future
    const expiry = new Date(expirationDate)
    if (expiry <= new Date()) {
      return NextResponse.json(
        { error: 'Expiration date must be in the future' },
        { status: 400 }
      )
    }

    // Create reminder
    const newReminder = await db
      .insert(reminders)
      .values({
        userId,
        title,
        description,
        expirationDate: expiry,
        type,
        priority,
        influencerId: influencerId || null,
        campaignId: campaignId || null,
        metadata: metadata || null
      })
      .returning()

    return NextResponse.json({
      reminder: newReminder[0],
      message: 'Reminder created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
} 