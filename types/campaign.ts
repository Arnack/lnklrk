export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  briefUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed fields
  totalInfluencers?: number;
  totalSpent?: number;
  averagePerformanceRating?: number;
}

export interface CampaignInfluencer {
  id: string;
  campaignId: string;
  influencerId: string;
  status: 'contacted' | 'confirmed' | 'posted' | 'paid';
  rate?: number;
  performanceRating?: number; // 1-5 rating
  deliverables?: Deliverable[];
  performance?: Performance;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  influencer?: {
    id: string;
    handle: string;
    followers: number;
    email?: string;
    platform: string;
    profileLink?: string;
  };
  campaign?: Campaign;
}

export interface Deliverable {
  type: 'post' | 'story' | 'reel' | 'video' | 'blog' | 'other';
  description: string;
  completed: boolean;
  deliveredAt?: string;
  url?: string;
}

export interface Performance {
  impressions?: number;
  engagement?: number;
  clicks?: number;
  conversions?: number;
  reach?: number;
  saves?: number;
  shares?: number;
}

export interface CampaignWithInfluencers extends Campaign {
  influencers: CampaignInfluencer[];
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: Campaign['status'];
  influencerCount: number;
  totalBudget?: number;
  spentBudget: number;
  startDate?: string;
  endDate?: string;
} 