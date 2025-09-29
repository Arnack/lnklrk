import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { massEmailCampaigns, massEmailRecipients } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/mass-email/[id] - Get a specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    const [campaign] = await db
      .select()
      .from(massEmailCampaigns)
      .where(eq(massEmailCampaigns.id, campaignId))

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const recipients = await db
      .select()
      .from(massEmailRecipients)
      .where(eq(massEmailRecipients.campaignId, campaignId))

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

    const [updatedCampaign] = await db
      .update(massEmailCampaigns)
      .set({
        name,
        subject,
        content,
        status,
        stats,
        updatedAt: new Date()
      })
      .where(eq(massEmailCampaigns.id, campaignId))
      .returning()

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
    await db
      .delete(massEmailRecipients)
      .where(eq(massEmailRecipients.campaignId, campaignId))

    // Delete campaign
    await db
      .delete(massEmailCampaigns)
      .where(eq(massEmailCampaigns.id, campaignId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
