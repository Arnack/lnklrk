import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/mass-email/[id] - Get a specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    const [campaign] = await sql`
      SELECT * FROM mass_email_campaigns 
      WHERE id = ${campaignId}
    `

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const recipients = await sql`
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
      WHERE campaign_id = ${campaignId}
    `

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        recipients
      }
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

// PUT /api/mass-email/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { name, subject, content, status, stats } = body

    const [updatedCampaign] = await sql`
      UPDATE mass_email_campaigns 
      SET 
        name = ${name},
        subject = ${subject},
        content = ${content},
        status = ${status},
        stats = ${JSON.stringify(stats)},
        updated_at = NOW()
      WHERE id = ${campaignId}
      RETURNING *
    `

    if (!updatedCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/mass-email/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Delete recipients first
    await sql`
      DELETE FROM mass_email_recipients 
      WHERE campaign_id = ${campaignId}
    `

    // Delete campaign
    await sql`
      DELETE FROM mass_email_campaigns 
      WHERE id = ${campaignId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
