import { NextResponse } from 'next/server';
import { authenticateUserRaw } from '@/lib/auth';
import { db, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { currentEmail, newEmail, password } = await request.json();

    if (!currentEmail || !newEmail || !password) {
      return NextResponse.json(
        { error: 'Current email, new email, and password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify current credentials
    const user = await authenticateUserRaw(currentEmail, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid current credentials' },
        { status: 401 }
      );
    }

    // Check if new email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${newEmail} AND id != ${user.id} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email address already in use' },
        { status: 409 }
      );
    }

    // Update email in database
    await sql`
      UPDATE users 
      SET email = ${newEmail}, updated_at = NOW() 
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      message: 'Email updated successfully',
      user: {
        id: user.id,
        email: newEmail,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Email change failed:', error);
    return NextResponse.json(
      { error: 'Email change failed' },
      { status: 500 }
    );
  }
} 