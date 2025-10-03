import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/recipients/[id] - Get a specific recipient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id

    const [recipient] = await sql`
      SELECT 
        id,
        name,
        email,
        platform,
        followers,
        category,
        tags,
        custom_fields,
        COALESCE(type, 'creator') as type,
        COALESCE(tiktok, false) as tiktok,
        COALESCE(instagram, false) as instagram,
        COALESCE(youtube, false) as youtube,
        COALESCE(ugc, false) as ugc,
        status,
        created_at,
        updated_at
      FROM mass_email_recipients 
      WHERE id = ${recipientId}
    `

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    return NextResponse.json({ recipient })
  } catch (error) {
    console.error('Error fetching recipient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipient' },
      { status: 500 }
    )
  }
}

// PUT /api/recipients/[id] - Update a recipient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id
    const body = await request.json()
    const { 
      name, 
      email, 
      platform,
      followers,
      category,
      tags,
      customFields,
      type,
      tiktok,
      instagram,
      youtube,
      ugc
    } = body

    const [updatedRecipient] = await sql`
      UPDATE mass_email_recipients 
      SET 
        name = ${name},
        email = ${email},
        platform = ${platform || null},
        followers = ${followers || null},
        category = ${category || null},
        tags = ${tags || []},
        custom_fields = ${JSON.stringify(customFields || {})},
        type = ${type || 'creator'},
        tiktok = ${tiktok || false},
        instagram = ${instagram || false},
        youtube = ${youtube || false},
        ugc = ${ugc || false},
        updated_at = NOW()
      WHERE id = ${recipientId}
      RETURNING *
    `

    if (!updatedRecipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    return NextResponse.json({ recipient: updatedRecipient })
  } catch (error) {
    console.error('Error updating recipient:', error)
    return NextResponse.json(
      { error: 'Failed to update recipient' },
      { status: 500 }
    )
  }
}

// DELETE /api/recipients/[id] - Delete a recipient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipientId = params.id

    await sql`
      DELETE FROM mass_email_recipients 
      WHERE id = ${recipientId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipient:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipient' },
      { status: 500 }
    )
  }
}
