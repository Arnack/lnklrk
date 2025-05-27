import { v4 as uuidv4 } from "uuid"
import type { Influencer } from "@/types/influencer"

// Sample data for initial setup
const sampleInfluencers: Influencer[] = [
  {
    id: uuidv4(),
    handle: "@fashionista",
    profileLink: "https://instagram.com/fashionista",
    followers: 250000,
    email: "fashionista@example.com",
    rate: 2500,
    categories: ["Fashion", "Lifestyle", "Beauty"],
    followersAge: "18-24 (65%), 25-34 (25%)",
    followersSex: "Female-dominant (80%)",
    engagementRate: 3.2,
    platform: "Instagram",
    brandsWorkedWith: ["Zara", "H&M", "ASOS"],
    notes: [
      {
        id: uuidv4(),
        content: "Very responsive to emails. Prefers to be contacted in the morning.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    files: [],
    messages: [
      {
        id: uuidv4(),
        direction: "outgoing",
        subject: "Summer Campaign Opportunity",
        content:
          "Hi there! We're planning our summer campaign and would love to work with you. Are you available in June?",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuidv4(),
        direction: "incoming",
        subject: "Re: Summer Campaign Opportunity",
        content:
          "Hello! Thanks for reaching out. I'm definitely interested and have availability in June. Could you share more details about the campaign?",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    campaigns: [
      {
        id: uuidv4(),
        name: "Spring Collection Launch",
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        payment: 2000,
        paymentStatus: "paid",
        performance: {
          impressions: 120000,
          engagement: 15000,
          clicks: 3200,
          conversions: 450,
        },
        notes: "Exceeded expectations with engagement. Would work with again.",
      },
    ],
  },
  {
    id: uuidv4(),
    handle: "@techguru",
    profileLink: "https://youtube.com/techguru",
    followers: 500000,
    email: "techguru@example.com",
    rate: 5000,
    categories: ["Technology", "Gaming", "Reviews"],
    followersAge: "18-24 (45%), 25-34 (40%)",
    followersSex: "Male-dominant (75%)",
    engagementRate: 4.5,
    platform: "YouTube",
    brandsWorkedWith: ["Samsung", "Razer", "NVIDIA"],
    notes: [],
    files: [],
    messages: [],
    campaigns: [],
  },
  {
    id: uuidv4(),
    handle: "@foodielove",
    profileLink: "https://instagram.com/foodielove",
    followers: 150000,
    email: "foodielove@example.com",
    rate: 1500,
    categories: ["Food", "Cooking", "Lifestyle"],
    followersAge: "25-34 (50%), 35-44 (30%)",
    followersSex: "Balanced (55% female)",
    engagementRate: 5.8,
    platform: "Instagram",
    brandsWorkedWith: ["HelloFresh", "KitchenAid", "Whole Foods"],
    notes: [],
    files: [],
    messages: [],
    campaigns: [],
  },
  {
    id: uuidv4(),
    handle: "@fitnessmotivation",
    profileLink: "https://instagram.com/fitnessmotivation",
    followers: 320000,
    email: "fitness@example.com",
    rate: 3000,
    categories: ["Fitness", "Health", "Wellness"],
    followersAge: "18-24 (35%), 25-34 (45%)",
    followersSex: "Balanced (60% female)",
    engagementRate: 4.2,
    platform: "Instagram",
    brandsWorkedWith: ["Nike", "Gymshark", "MyProtein"],
    notes: [],
    files: [],
    messages: [],
    campaigns: [],
  },
  {
    id: uuidv4(),
    handle: "@traveltheworld",
    profileLink: "https://instagram.com/traveltheworld",
    followers: 420000,
    email: "travel@example.com",
    rate: 3500,
    categories: ["Travel", "Photography", "Lifestyle"],
    followersAge: "25-34 (55%), 35-44 (25%)",
    followersSex: "Balanced (52% female)",
    engagementRate: 3.8,
    platform: "Instagram",
    brandsWorkedWith: ["Airbnb", "Away", "Expedia"],
    notes: [],
    files: [],
    messages: [],
    campaigns: [],
  },
  {
    id: uuidv4(),
    handle: "@gamingpro",
    profileLink: "https://twitch.tv/gamingpro",
    followers: 180000,
    email: "gaming@example.com",
    rate: 2000,
    categories: ["Gaming", "Esports", "Technology"],
    followersAge: "13-17 (30%), 18-24 (50%)",
    followersSex: "Male-dominant (85%)",
    engagementRate: 6.5,
    platform: "Twitch",
    brandsWorkedWith: ["Logitech", "Red Bull", "Discord"],
    notes: [],
    files: [],
    messages: [],
    campaigns: [],
  },
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
