import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Simple function to decode the user info from access token
// In a real system, you'd validate the token signature
function getUserIdFromToken(token: string): string | null {
  try {
    // For now, we'll need to find the user by token
    // In a proper implementation, you'd decode the JWT or validate with auth service
    return null; // We'll use a different approach
  } catch {
    return null;
  }
}

// GET /api/auth/user - Get current user data
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter for now
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 401 });
    }

    const result = await sql`
      SELECT id, email, name, is_active, google_client_id, google_api_key, created_at, updated_at
      FROM users 
      WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.is_active,
      googleClientId: user.google_client_id,
      googleApiKey: user.google_api_key,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/auth/user - Update user data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, googleClientId, googleApiKey, userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 401 });
    }

    const result = await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        google_client_id = ${googleClientId || null},
        google_api_key = ${googleApiKey || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, email, name, is_active, google_client_id, google_api_key, created_at, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.is_active,
      googleClientId: user.google_client_id,
      googleApiKey: user.google_api_key,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 