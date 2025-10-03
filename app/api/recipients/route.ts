import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/recipients - Get all recipients for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // For now, we'll get all recipients - in a real app, you'd want a separate recipients table
    // that's not tied to campaigns, or implement proper filtering
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
      LIMIT 100
    `

    return NextResponse.json({ recipients })
  } catch (error) {
    console.error('Error fetching recipients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}

// POST /api/recipients - Create a new recipient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      campaignId,
      userId,
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

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // If no campaign ID provided, get the first available campaign for this user
    let finalCampaignId = campaignId
    if (!finalCampaignId) {
      const [existingCampaign] = await sql`
        SELECT id FROM mass_email_campaigns 
        WHERE user_id = ${userId} 
        LIMIT 1
      `
      if (existingCampaign) {
        finalCampaignId = existingCampaign.id
      } else {
        return NextResponse.json(
          { error: 'No campaigns found. Please create a campaign first.' },
          { status: 400 }
        )
      }
    }

    const [recipient] = await sql`
      INSERT INTO mass_email_recipients (
        campaign_id, name, email, platform, followers, category, tags, 
        custom_fields, type, tiktok, instagram, youtube, ugc, status
      )
      VALUES (
        ${finalCampaignId}, ${name}, ${email}, ${platform || null}, ${followers || null}, 
        ${category || null}, ${tags || []}, ${JSON.stringify(customFields || {})}, 
        ${type || 'creator'}, ${tiktok || false}, ${instagram || false}, 
        ${youtube || false}, ${ugc || false}, 'pending'
      )
      RETURNING *
    `

    return NextResponse.json({ recipient }, { status: 201 })
  } catch (error) {
    console.error('Error creating recipient:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to create recipient', details: error.message },
      { status: 500 }
    )
  }
}
