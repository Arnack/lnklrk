import { NextRequest, NextResponse } from 'next/server';
import { getAllInfluencers, createInfluencer } from '@/lib/database';
import type { Influencer } from '@/types/influencer';

// Mark as server-side only
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const influencers = await getAllInfluencers(userId);
    return NextResponse.json(influencers);
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const data = await request.json();
    const influencer = await createInfluencer({
      ...data,
      userId,
    });
    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Failed to create influencer:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    );
  }
} 