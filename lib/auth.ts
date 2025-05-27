import bcrypt from 'bcryptjs';
import { db } from './db';
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
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    if (!(user.isActive ?? true)) {
      return null;
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }
    
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