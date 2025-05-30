import { NextRequest, NextResponse } from 'next/server';
import { addInfluencerToCampaign, updateCampaignInfluencer, removeInfluencerFromCampaign } from '@/lib/campaigns';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const campaignInfluencer = await addInfluencerToCampaign({
      campaignId: params.id,
      influencerId: data.influencerId,
      status: data.status || 'contacted',
      rate: data.rate,
      performanceRating: data.performanceRating,
      deliverables: data.deliverables,
      performance: data.performance,
      notes: data.notes,
    });
    
    return NextResponse.json(campaignInfluencer, { status: 201 });
  } catch (error) {
    console.error('Failed to add influencer to campaign:', error);
    return NextResponse.json({ error: 'Failed to add influencer to campaign' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { campaignInfluencerId, ...updateData } = data;
    
    const campaignInfluencer = await updateCampaignInfluencer(campaignInfluencerId, updateData);
    
    return NextResponse.json(campaignInfluencer);
  } catch (error) {
    console.error('Failed to update campaign influencer:', error);
    return NextResponse.json({ error: 'Failed to update campaign influencer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get('influencerId');
    
    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 });
    }
    
    await removeInfluencerFromCampaign(params.id, influencerId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove influencer from campaign:', error);
    return NextResponse.json({ error: 'Failed to remove influencer from campaign' }, { status: 500 });
  }
} 