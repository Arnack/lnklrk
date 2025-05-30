import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerCampaigns } from '@/lib/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaigns = await getInfluencerCampaigns(params.id);
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch influencer campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
} 