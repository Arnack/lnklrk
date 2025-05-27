import bcrypt from 'bcryptjs';
import { db, sql } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export type User = {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();
    
    const user = result[0];
    
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('Authenticating user:', email);
    
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    console.log('Query result:', result);
    
    if (result.length === 0) {
      console.log('No user found with email:', email);
      return null;
    }
    
    const user = result[0];
    
    if (!(user.isActive ?? true)) {
      console.log('User is not active:', email);
      return null;
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return null;
    }
    
    console.log('Authentication successful for user:', email);
    
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error('Authentication failed');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    throw new Error('Failed to get user');
  }
}

// Alternative authentication using raw SQL
export async function authenticateUserRaw(email: string, password: string): Promise<User | null> {
  try {
    console.log('Authenticating user with raw SQL:', email);
    
    const result = await sql`
      SELECT id, email, password, name, is_active, created_at, updated_at 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;
    
    console.log('Raw SQL query result:', result);
    
    if (result.length === 0) {
      console.log('No user found with email:', email);
      return null;
    }
    
    const user = result[0];
    
    if (!user.is_active) {
      console.log('User is not active:', email);
      return null;
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return null;
    }
    
    console.log('Authentication successful for user:', email);
    
    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.is_active ?? true,
      createdAt: user.created_at ?? new Date(),
      updatedAt: user.updated_at ?? new Date(),
    };
  } catch (error) {
    console.error('Failed to authenticate user with raw SQL:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Authentication failed');
  }
} 