import { v4 as uuidv4 } from "uuid"
import type { Influencer } from "@/types/influencer"
import { sql } from './db';

// Export types for use in other files
export type DbInfluencer = {
  id: string;
  userId: string;
  handle: string;
  profileLink?: string;
  followers?: number;
  email?: string;
  rate?: number;
  categories?: string[];
  tags?: string[];
  followersAge?: string;
  followers_age?: string;
  followersSex?: string;
  followers_sex?: string;
  engagementRate?: number;
  engagement_rate?: number;
  platform?: string;
  brandsWorkedWith?: string[];
  brands_worked_with?: string[];
  notes?: any;
  files?: any;
  messages?: any;
  campaigns?: any;
  createdAt?: Date;
  updatedAt?: Date;
};
export type DbInfluencerUpdate = Partial<DbInfluencer>;

// Sample data for initial setup
const sampleInfluencers: Influencer[] = []

export async function initializeDatabase() {
  try {
    const localForage = (await import("localforage")).default

    // Configure localForage
    localForage.config({
      name: "influencer-crm",
      storeName: "influencer_data",
    })

    // Check if we already have data
    const existingData = await localForage.getItem<Influencer[]>("influencers")

    // Only initialize with sample data if no data exists
    if (!existingData || existingData.length === 0) {
      await localForage.setItem("influencers", sampleInfluencers)
      console.log("Database initialized with sample data")
    }
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

export async function getAllInfluencers(userId?: string) {
  try {
    console.log('Fetching all influencers with raw SQL', userId ? `for user ${userId}` : '');
    
    let results;
    if (userId) {
      results = await sql`
        SELECT * FROM influencers WHERE user_id = ${userId} ORDER BY created_at DESC
      `;
    } else {
      // Fallback for backward compatibility, but this should be avoided in production
      results = await sql`
        SELECT * FROM influencers ORDER BY created_at DESC
      `;
    }
    
    console.log('Raw SQL query result:', results);
    return results;
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    throw error;
  }
}

export async function getInfluencerById(id: string) {
  try {
    console.log('Fetching influencer by ID:', id);
    const result = await sql`
      SELECT * FROM influencers WHERE id = ${id} LIMIT 1
    `;
    // console.log('Influencer query result:', result);
    return result[0];
  } catch (error) {
    console.error('Failed to fetch influencer:', error);
    throw error;
  }
}

export async function createInfluencer(data: Omit<DbInfluencer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    console.log('Creating influencer with data:', data);
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await sql`
      INSERT INTO influencers (
        id, user_id, handle, profile_link, followers, email, rate, 
        categories, tags, followers_age, followers_sex, engagement_rate, 
        platform, brands_worked_with, notes, files, messages, campaigns,
        created_at, updated_at
      ) VALUES (
        ${id}, ${data.userId}, ${data.handle}, ${data.profileLink || null}, 
        ${data.followers || 0}, ${data.email || null}, ${data.rate || 0},
        ${data.categories || []}, ${data.tags || []}, ${data.followersAge || data.followers_age || null},
        ${data.followersSex || data.followers_sex || null}, 
        ${data.engagementRate || 0}, ${data.platform || 'Instagram'}, 
        ${data.brandsWorkedWith || []}, ${JSON.stringify(data.notes || [])}, 
        ${JSON.stringify(data.files || [])}, ${JSON.stringify(data.messages || [])}, 
        ${JSON.stringify(data.campaigns || [])}, ${now}, ${now}
      ) RETURNING *
    `;
    
    console.log('Created influencer:', result);
    return result[0];
  } catch (error) {
    console.error('Failed to create influencer:', error);
    throw error;
  }
}

export async function updateInfluencer(id: string, data: DbInfluencerUpdate) {
  try {
    console.log('Updating influencer:', id, data);
    
    const now = new Date().toISOString();
    
    // For simplicity, let's update all fields. In a production app, you'd want to be more selective
    const result = await sql`
      UPDATE influencers 
      SET 
        handle = ${data.handle || null},
        profile_link = ${data.profileLink || null},
        followers = ${data.followers || 0},
        email = ${data.email || null},
        rate = ${data.rate || 0},
        categories = ${data.categories || []},
        tags = ${data.tags || []},
        followers_age = ${data.followersAge || data.followers_age || null},
        followers_sex = ${data.followersSex || data.followers_sex || null},
        engagement_rate = ${data.engagementRate || data.engagement_rate || 0},
        platform = ${data.platform || 'Instagram'},
        brands_worked_with = ${data.brandsWorkedWith || data.brands_worked_with || []},
        notes = ${JSON.stringify(data.notes || [])},
        files = ${JSON.stringify(data.files || [])},
        messages = ${JSON.stringify(data.messages || [])},
        campaigns = ${JSON.stringify(data.campaigns || [])},
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;
    
    console.log('Updated influencer:', result);
    return result[0];
  } catch (error) {
    console.error('Failed to update influencer:', error);
    throw error;
  }
}

export async function deleteInfluencer(id: string) {
  try {
    console.log('Deleting influencer:', id);
    await sql`
      DELETE FROM influencers WHERE id = ${id}
    `;
    console.log('Deleted influencer successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete influencer:', error);
    throw error;
  }
}

export async function importInfluencers(data: Array<Omit<DbInfluencer, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    console.log('Importing influencers:', data.length);
    
    const results = [];
    const now = new Date().toISOString();
    
    for (const item of data) {
      const id = uuidv4();
      
      const result = await sql`
        INSERT INTO influencers (
          id, user_id, handle, profile_link, followers, email, rate, 
          categories, tags, followers_age, followers_sex, engagement_rate, 
          platform, brands_worked_with, notes, files, messages, campaigns,
          created_at, updated_at
        ) VALUES (
          ${id}, ${item.userId}, ${item.handle}, ${item.profileLink || null}, 
          ${item.followers || 0}, ${item.email || null}, ${item.rate || 0},
          ${item.categories || []}, ${item.tags || []}, ${item.followersAge || null}, ${item.followersSex || null}, 
          ${item.engagementRate || 0}, ${item.platform || 'Instagram'}, 
          ${item.brandsWorkedWith || []}, ${JSON.stringify(item.notes || [])}, 
          ${JSON.stringify(item.files || [])}, ${JSON.stringify(item.messages || [])}, 
          ${JSON.stringify(item.campaigns || [])}, ${now}, ${now}
        ) RETURNING *
      `;
      
      results.push(result[0]);
    }
    
    console.log('Imported influencers successfully:', results.length);
    return results;
  } catch (error) {
    console.error('Failed to import influencers:', error);
    throw error;
  }
}

// Reminder database functions
export async function getAllReminders(userId: string, options?: {
  active?: boolean;
  type?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    console.log('Fetching reminders for user:', userId, options);
    
    // Build dynamic query using template literal
    let whereClause = 'user_id = $1';
    const params = [userId];
    let paramIndex = 2;
    
    if (options?.active) {
      whereClause += ' AND is_completed = false AND is_expired = false';
    }
    
    if (options?.type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(options.type);
      paramIndex++;
    }
    
    if (options?.priority) {
      whereClause += ` AND priority = $${paramIndex}`;
      params.push(options.priority);
      paramIndex++;
    }
    
    let limitClause = '';
    if (options?.limit) {
      limitClause = ` LIMIT $${paramIndex}`;
      params.push(options.limit.toString());
      paramIndex++;
      
      if (options?.offset) {
        limitClause += ` OFFSET $${paramIndex}`;
        params.push(options.offset.toString());
      }
    }
    
    // Use direct template literal for complex query
    if (options?.active) {
      const result = await sql`
        SELECT * FROM reminders 
        WHERE user_id = ${userId} 
        AND is_completed = false 
        AND is_expired = false
        ORDER BY expiration_date ASC
        ${options.limit ? sql`LIMIT ${options.limit}` : sql``}
      `;
      console.log('Reminders query result:', result);
      return result.map(transformReminderData);
    } else {
      const result = await sql`
        SELECT * FROM reminders 
        WHERE user_id = ${userId}
        ORDER BY expiration_date ASC
        ${options?.limit ? sql`LIMIT ${options.limit}` : sql``}
      `;
      console.log('Reminders query result:', result);
      return result.map(transformReminderData);
    }
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    throw error;
  }
}

export async function getReminderById(id: string, userId: string) {
  try {
    console.log('Fetching reminder by ID:', id, 'for user:', userId);
    const result = await sql`
      SELECT * FROM reminders WHERE id = ${id} AND user_id = ${userId} LIMIT 1
    `;
    return transformReminderData(result[0]);
  } catch (error) {
    console.error('Failed to fetch reminder:', error);
    throw error;
  }
}

export async function createReminder(data: {
  userId: string;
  title: string;
  description?: string;
  expirationDate: Date;
  type?: string;
  priority?: string;
  influencerId?: string;
  campaignId?: string;
  metadata?: any;
}) {
  try {
    console.log('Creating reminder with data:', data);
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await sql`
      INSERT INTO reminders (
        id, user_id, title, description, expiration_date, type, priority,
        influencer_id, campaign_id, metadata, created_at, updated_at
      ) VALUES (
        ${id}, ${data.userId}, ${data.title}, ${data.description || null},
        ${data.expirationDate.toISOString()}, ${data.type || 'general'}, 
        ${data.priority || 'medium'}, ${data.influencerId || null}, 
        ${data.campaignId || null}, ${JSON.stringify(data.metadata || null)},
        ${now}, ${now}
      ) RETURNING *
    `;
    
    console.log('Created reminder:', result);
    return transformReminderData(result[0]);
  } catch (error) {
    console.error('Failed to create reminder:', error);
    throw error;
  }
}

export async function updateReminder(id: string, userId: string, data: {
  title?: string;
  description?: string;
  expirationDate?: Date;
  type?: string;
  priority?: string;
  isCompleted?: boolean;
  isExpired?: boolean;
  influencerId?: string;
  campaignId?: string;
  metadata?: any;
}) {
  try {
    console.log('Updating reminder:', id, data);
    
    const now = new Date().toISOString();
    
    const result = await sql`
      UPDATE reminders 
      SET 
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        expiration_date = COALESCE(${data.expirationDate?.toISOString()}, expiration_date),
        type = COALESCE(${data.type}, type),
        priority = COALESCE(${data.priority}, priority),
        is_completed = COALESCE(${data.isCompleted}, is_completed),
        is_expired = COALESCE(${data.isExpired}, is_expired),
        influencer_id = COALESCE(${data.influencerId}, influencer_id),
        campaign_id = COALESCE(${data.campaignId}, campaign_id),
        metadata = COALESCE(${JSON.stringify(data.metadata)}, metadata),
        updated_at = ${now}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    
    console.log('Updated reminder:', result);
    return transformReminderData(result[0]);
  } catch (error) {
    console.error('Failed to update reminder:', error);
    throw error;
  }
}

export async function deleteReminder(id: string, userId: string) {
  try {
    console.log('Deleting reminder:', id, 'for user:', userId);
    const result = await sql`
      DELETE FROM reminders WHERE id = ${id} AND user_id = ${userId} RETURNING *
    `;
    console.log('Deleted reminder:', result);
    return result.length > 0;
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    throw error;
  }
}

// Helper function to transform database reminder data to camelCase
function transformReminderData(dbReminder: any) {
  if (!dbReminder) return null;
  
  return {
    id: dbReminder.id,
    title: dbReminder.title,
    description: dbReminder.description,
    expirationDate: dbReminder.expiration_date,
    priority: dbReminder.priority,
    type: dbReminder.type,
    isExpired: dbReminder.is_expired,
    isCompleted: dbReminder.is_completed,
    influencerId: dbReminder.influencer_id,
    campaignId: dbReminder.campaign_id,
    metadata: dbReminder.metadata,
    createdAt: dbReminder.created_at,
    updatedAt: dbReminder.updated_at,
  };
}



