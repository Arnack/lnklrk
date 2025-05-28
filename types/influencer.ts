export interface Influencer {
  id: string
  handle: string
  profileLink: string
  profile_link: string
  followers: number
  email?: string
  rate: number
  categories: string[]
  followersAge: string
  followers_age: string
  followersSex: string
  followers_sex: string
  engagementRate: number
  engagement_rate: number
  platform: string
  brandsWorkedWith?: string[]
  brands_worked_with?: string[]
  notes?: {
    id: string
    content: string
    date: string
  }[]
  files?: {
    id: string
    name: string
    type: string
    size: number
    data: string
    date: string
    description?: string
  }[]
  messages?: {
    id: string
    direction: "incoming" | "outgoing"
    subject: string
    content: string
    date: string
  }[]
  campaigns?: {
    id: string
    name: string
    startDate: string
    endDate?: string
    status: "planned" | "active" | "completed" | "cancelled"
    payment: number
    paymentStatus: "pending" | "partial" | "paid"
    performance?: {
      impressions?: number
      engagement?: number
      clicks?: number
      conversions?: number
    }
    notes?: string
  }[]
}
