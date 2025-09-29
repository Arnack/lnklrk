import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/mass-email - Get all mass email campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const campaigns = await sql`
      SELECT * FROM mass_email_campaigns 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `

    // Get recipients for each campaign
    const campaignsWithRecipients = await Promise.all(
      campaigns.map(async (campaign) => {
        const recipients = await sql`
          SELECT * FROM mass_email_recipients 
          WHERE campaign_id = ${campaign.id}
        `

        return {
          ...campaign,
          recipients
        }
      })
    )

    return NextResponse.json({ campaigns: campaignsWithRecipients })
  } catch (error) {
    console.error('Error fetching mass email campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/mass-email - Create a new mass email campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      name, 
      subject, 
      content, 
      recipients, 
      templateId,
      templateVariables 
    } = body

    if (!userId || !name || !subject || !content || !recipients?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create campaign
    const [campaign] = await sql`
      INSERT INTO mass_email_campaigns (user_id, name, subject, content, template_id, template_variables, status, stats)
      VALUES (${userId}, ${name}, ${subject}, ${content}, ${templateId || null}, ${JSON.stringify(templateVariables || {})}, 'draft', ${JSON.stringify({
        total: recipients.length,
        sent: 0,
        failed: 0,
        pending: recipients.length
      })})
      RETURNING *
    `

    // Create recipients
    const createdRecipients = []
    for (const recipient of recipients) {
      const [createdRecipient] = await sql`
        INSERT INTO mass_email_recipients (campaign_id, name, email, platform, followers, category, tags, custom_fields, status)
        VALUES (${campaign.id}, ${recipient.name}, ${recipient.email}, ${recipient.platform || null}, ${recipient.followers || null}, ${recipient.category || null}, ${recipient.tags || []}, ${JSON.stringify(recipient.customFields || {})}, 'pending')
        RETURNING *
      `
      createdRecipients.push(createdRecipient)
    }

    // Return campaign with recipients
    const campaignWithRecipients = {
      ...campaign,
      recipients: createdRecipients
    }

    return NextResponse.json({ campaign: campaignWithRecipients }, { status: 201 })
  } catch (error) {
    console.error('Error creating mass email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
