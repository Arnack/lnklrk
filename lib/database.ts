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
  followersAge?: string;
  followersSex?: string;
  engagementRate?: number;
  platform?: string;
  brandsWorkedWith?: string[];
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

export async function getAllInfluencers() {
  try {
    console.log('Fetching all influencers with raw SQL');
    const results = await sql`
      SELECT * FROM influencers ORDER BY created_at DESC
    `;
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
    console.log('Influencer query result:', result);
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
        categories, followers_age, followers_sex, engagement_rate, 
        platform, brands_worked_with, notes, files, messages, campaigns,
        created_at, updated_at
      ) VALUES (
        ${id}, ${data.userId}, ${data.handle}, ${data.profileLink || null}, 
        ${data.followers || 0}, ${data.email || null}, ${data.rate || 0},
        ${data.categories || []}, ${data.followersAge || null}, ${data.followersSex || null}, 
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
        followers_age = ${data.followersAge || null},
        followers_sex = ${data.followersSex || null},
        engagement_rate = ${data.engagementRate || 0},
        platform = ${data.platform || 'Instagram'},
        brands_worked_with = ${data.brandsWorkedWith || []},
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
          categories, followers_age, followers_sex, engagement_rate, 
          platform, brands_worked_with, notes, files, messages, campaigns,
          created_at, updated_at
        ) VALUES (
          ${id}, ${item.userId}, ${item.handle}, ${item.profileLink || null}, 
          ${item.followers || 0}, ${item.email || null}, ${item.rate || 0},
          ${item.categories || []}, ${item.followersAge || null}, ${item.followersSex || null}, 
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



