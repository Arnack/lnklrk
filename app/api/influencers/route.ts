import { NextResponse } from 'next/server';
import { getAllInfluencers, createInfluencer } from '@/lib/database';
import type { Influencer } from '@/types/influencer';

// Mark as server-side only
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const influencers = await getAllInfluencers();
    return NextResponse.json(influencers);
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const influencer = await createInfluencer(data);
    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Failed to create influencer:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    );
  }
} 