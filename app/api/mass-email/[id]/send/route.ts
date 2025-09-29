import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { massEmailCampaigns, massEmailRecipients } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { replaceVariables } from '@/lib/email-templates'

// POST /api/mass-email/[id]/send - Send a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { gmailAccessToken } = body

    if (!gmailAccessToken) {
      return NextResponse.json(
        { error: 'Gmail access token is required' },
        { status: 400 }
      )
    }

    // Get campaign
    const [campaign] = await db
      .select()
      .from(massEmailCampaigns)
      .where(eq(massEmailCampaigns.id, campaignId))

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      )
    }

    // Get recipients
    const recipients = await db
      .select()
      .from(massEmailRecipients)
      .where(eq(massEmailRecipients.campaignId, campaignId))

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found for this campaign' },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    await db
      .update(massEmailCampaigns)
      .set({ 
        status: 'sending',
        updatedAt: new Date()
      })
      .where(eq(massEmailCampaigns.id, campaignId))

    // Send emails
    let sent = 0
    let failed = 0

    for (const recipient of recipients) {
      try {
        // Personalize email content
        const personalizedSubject = replaceVariables(campaign.subject, {
          ...campaign.templateVariables,
          influencerName: recipient.name,
          ...recipient.customFields
        })

        const personalizedContent = replaceVariables(campaign.content, {
          ...campaign.templateVariables,
          influencerName: recipient.name,
          ...recipient.customFields
        })

        // Send email via Gmail API
        const emailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gmailAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: btoa([
              `To: ${recipient.email}`,
              `Subject: ${personalizedSubject}`,
              'Content-Type: text/html; charset=utf-8',
              '',
              personalizedContent
            ].join('\r\n'))
          })
        })

        if (emailResponse.ok) {
          // Update recipient status
          await db
            .update(massEmailRecipients)
            .set({ 
              status: 'sent',
              sentAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(massEmailRecipients.id, recipient.id))

          sent++
        } else {
          throw new Error(`Failed to send email: ${emailResponse.statusText}`)
        }
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error)
        
        // Update recipient status
        await db
          .update(massEmailRecipients)
          .set({ 
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date()
          })
          .where(eq(massEmailRecipients.id, recipient.id))

        failed++
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Update campaign final status
    const finalStatus = failed === 0 ? 'sent' : (sent === 0 ? 'failed' : 'sent')
    
    await db
      .update(massEmailCampaigns)
      .set({ 
        status: finalStatus,
        stats: {
          total: recipients.length,
          sent,
          failed,
          pending: 0
        },
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(massEmailCampaigns.id, campaignId))

    return NextResponse.json({ 
      success: true,
      stats: {
        total: recipients.length,
        sent,
        failed,
        pending: 0
      }
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    
    // Update campaign status to failed
    await db
      .update(massEmailCampaigns)
      .set({ 
        status: 'failed',
        updatedAt: new Date()
      })
      .where(eq(massEmailCampaigns.id, campaignId))

    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
}
