import { NextResponse } from 'next/server';
import { getInfluencerById, updateInfluencer, deleteInfluencer } from '@/lib/database';

// Mark as server-side only
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const influencer = await getInfluencerById(params.id);
    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Failed to fetch influencer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const influencer = await updateInfluencer(params.id, data);
    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Failed to update influencer:', error);
    return NextResponse.json(
      { error: 'Failed to update influencer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteInfluencer(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete influencer:', error);
    return NextResponse.json(
      { error: 'Failed to delete influencer' },
      { status: 500 }
    );
  }
} 