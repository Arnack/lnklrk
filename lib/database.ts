import { v4 as uuidv4 } from "uuid"
import type { Influencer } from "@/types/influencer"
import { db } from './db';
import { influencers } from './schema';
import { eq } from 'drizzle-orm';

// Sample data for initial setup
const sampleInfluencers: Influencer[] = [
  // {
  //   id: uuidv4(),
  //   handle: "@fashionista",
  //   profileLink: "https://instagram.com/fashionista",
  //   followers: 250000,
  //   email: "fashionista@example.com",
  //   rate: 2500,
  //   categories: ["Fashion", "Lifestyle", "Beauty"],
  //   followersAge: "18-24 (65%), 25-34 (25%)",
  //   followersSex: "Female-dominant (80%)",
  //   engagementRate: 3.2,
  //   platform: "Instagram",
  //   brandsWorkedWith: ["Zara", "H&M", "ASOS"],
  //   notes: [
  //     {
  //       id: uuidv4(),
  //       content: "Very responsive to emails. Prefers to be contacted in the morning.",
  //       date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  //     },
  //   ],
  //   files: [],
  //   messages: [
  //     {
  //       id: uuidv4(),
  //       direction: "outgoing",
  //       subject: "Summer Campaign Opportunity",
  //       content:
  //         "Hi there! We're planning our summer campaign and would love to work with you. Are you available in June?",
  //       date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  //     },
  //     {
  //       id: uuidv4(),
  //       direction: "incoming",
  //       subject: "Re: Summer Campaign Opportunity",
  //       content:
  //         "Hello! Thanks for reaching out. I'm definitely interested and have availability in June. Could you share more details about the campaign?",
  //       date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  //     },
  //   ],
  //   campaigns: [
  //     {
  //       id: uuidv4(),
  //       name: "Spring Collection Launch",
  //       startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  //       endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  //       status: "completed",
  //       payment: 2000,
  //       paymentStatus: "paid",
  //       performance: {
  //         impressions: 120000,
  //         engagement: 15000,
  //         clicks: 3200,
  //         conversions: 450,
  //       },
  //       notes: "Exceeded expectations with engagement. Would work with again.",
  //     },
  //   ],
  // },
]

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

type DbInfluencer = typeof influencers.$inferInsert;
type DbInfluencerUpdate = Partial<DbInfluencer>;

export async function getAllInfluencers() {
  try {
    const results = await db.select().from(influencers);
    return results;
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    throw error;
  }
}

export async function getInfluencerById(id: string) {
  try {
    const result = await db
      .select()
      .from(influencers)
      .where(eq(influencers.id, id));
    return result[0];
  } catch (error) {
    console.error('Failed to fetch influencer:', error);
    throw error;
  }
}

export async function createInfluencer(data: Omit<DbInfluencer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const result = await db.insert(influencers).values(data).returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create influencer:', error);
    throw error;
  }
}

export async function updateInfluencer(id: string, data: DbInfluencerUpdate) {
  try {
    const result = await db
      .update(influencers)
      .set(data)
      .where(eq(influencers.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to update influencer:', error);
    throw error;
  }
}

export async function deleteInfluencer(id: string) {
  try {
    await db.delete(influencers).where(eq(influencers.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete influencer:', error);
    throw error;
  }
}

export async function importInfluencers(data: Array<Omit<DbInfluencer, 'id' | 'createdAt' | 'updatedAt'>>) {
  try {
    const result = await db.insert(influencers).values(data).returning();
    return result;
  } catch (error) {
    console.error('Failed to import influencers:', error);
    throw error;
  }
}



