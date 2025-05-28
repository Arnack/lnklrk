import { NextResponse } from 'next/server';
import { authenticateUserRaw, hashPassword } from '@/lib/auth';
import { db, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, current password, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify current credentials
    const user = await authenticateUserRaw(email, currentPassword);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid current credentials' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in database
    await sql`
      UPDATE users 
      SET password = ${hashedNewPassword}, updated_at = NOW() 
      WHERE email = ${email}
    `;

    return NextResponse.json({
      message: 'Password updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Password change failed:', error);
    return NextResponse.json(
      { error: 'Password change failed' },
      { status: 500 }
    );
  }
} 