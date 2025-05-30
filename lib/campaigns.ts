import { v4 as uuidv4 } from "uuid";
import { sql } from './db';
import type { Campaign, CampaignInfluencer, CampaignWithInfluencers, CampaignSummary } from '@/types/campaign';

// Campaign CRUD operations
export async function getAllCampaigns(userId: string): Promise<Campaign[]> {
  try {
    const result = await sql`
      SELECT 
        c.*,
        COUNT(ci.id) as total_influencers,
        COALESCE(SUM(ci.rate), 0) as total_spent,
        ROUND(AVG(ci.performance_rating), 1) as average_performance_rating
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      startDate: row.start_date?.toISOString(),
      endDate: row.end_date?.toISOString(),
      budget: row.budget ? parseFloat(row.budget) : undefined,
      status: row.status,
      briefUrl: row.brief_url,
      notes: row.notes,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      totalInfluencers: parseInt(row.total_influencers) || 0,
      totalSpent: parseFloat(row.total_spent) || 0,
      averagePerformanceRating: row.average_performance_rating ? parseFloat(row.average_performance_rating) : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    throw error;
  }
}

export async function getCampaignById(id: string): Promise<CampaignWithInfluencers | null> {
  try {
    const campaignResult = await sql`
      SELECT * FROM campaigns WHERE id = ${id} LIMIT 1
    `;
    
    if (campaignResult.length === 0) {
      return null;
    }
    
    const campaignInfluencersResult = await sql`
      SELECT 
        ci.*,
        i.handle,
        i.followers,
        i.email,
        i.platform,
        i.profile_link
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.campaign_id = ${id}
      ORDER BY ci.created_at ASC
    `;
    
    const campaign = campaignResult[0];
    const influencers = campaignInfluencersResult.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status,
      rate: row.rate ? parseFloat(row.rate) : undefined,
      performanceRating: row.performance_rating,
      deliverables: row.deliverables || [],
      performance: row.performance || {},
      notes: row.notes,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      influencer: {
        id: row.influencer_id,
        handle: row.handle,
        followers: row.followers || 0,
        email: row.email,
        platform: row.platform || 'Instagram',
        profileLink: row.profile_link,
      },
    }));
    
    return {
      id: campaign.id,
      userId: campaign.user_id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.start_date?.toISOString(),
      endDate: campaign.end_date?.toISOString(),
      budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
      status: campaign.status,
      briefUrl: campaign.brief_url,
      notes: campaign.notes,
      createdAt: campaign.created_at?.toISOString(),
      updatedAt: campaign.updated_at?.toISOString(),
      influencers,
    };
  } catch (error) {
    console.error('Failed to fetch campaign:', error);
    throw error;
  }
}

export async function createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await sql`
      INSERT INTO campaigns (
        id, user_id, name, description, start_date, end_date, 
        budget, status, brief_url, notes, created_at, updated_at
      ) VALUES (
        ${id}, ${data.userId}, ${data.name}, ${data.description || null},
        ${data.startDate || null}, ${data.endDate || null}, ${data.budget || null},
        ${data.status}, ${data.briefUrl || null}, ${data.notes || null},
        ${now}, ${now}
      ) RETURNING *
    `;
    
    const campaign = result[0];
    return {
      id: campaign.id,
      userId: campaign.user_id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.start_date?.toISOString(),
      endDate: campaign.end_date?.toISOString(),
      budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
      status: campaign.status,
      briefUrl: campaign.brief_url,
      notes: campaign.notes,
      createdAt: campaign.created_at?.toISOString(),
      updatedAt: campaign.updated_at?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to create campaign:', error);
    throw error;
  }
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  try {
    const now = new Date().toISOString();
    
    const result = await sql`
      UPDATE campaigns 
      SET 
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        start_date = COALESCE(${data.startDate || null}, start_date),
        end_date = COALESCE(${data.endDate || null}, end_date),
        budget = COALESCE(${data.budget || null}, budget),
        status = COALESCE(${data.status}, status),
        brief_url = COALESCE(${data.briefUrl}, brief_url),
        notes = COALESCE(${data.notes}, notes),
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;
    
    const campaign = result[0];
    return {
      id: campaign.id,
      userId: campaign.user_id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.start_date?.toISOString(),
      endDate: campaign.end_date?.toISOString(),
      budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
      status: campaign.status,
      briefUrl: campaign.brief_url,
      notes: campaign.notes,
      createdAt: campaign.created_at?.toISOString(),
      updatedAt: campaign.updated_at?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to update campaign:', error);
    throw error;
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await sql`DELETE FROM campaigns WHERE id = ${id}`;
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    throw error;
  }
}

// Campaign-Influencer relationship operations
export async function addInfluencerToCampaign(data: Omit<CampaignInfluencer, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignInfluencer> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const result = await sql`
      INSERT INTO campaign_influencers (
        id, campaign_id, influencer_id, status, rate, performance_rating,
        deliverables, performance, notes, created_at, updated_at
      ) VALUES (
        ${id}, ${data.campaignId}, ${data.influencerId}, ${data.status},
        ${data.rate || null}, ${data.performanceRating || null},
        ${JSON.stringify(data.deliverables || [])}, ${JSON.stringify(data.performance || {})},
        ${data.notes || null}, ${now}, ${now}
      ) RETURNING *
    `;
    
    const row = result[0];
    return {
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status,
      rate: row.rate ? parseFloat(row.rate) : undefined,
      performanceRating: row.performance_rating,
      deliverables: row.deliverables || [],
      performance: row.performance || {},
      notes: row.notes,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to add influencer to campaign:', error);
    throw error;
  }
}

export async function updateCampaignInfluencer(id: string, data: Partial<CampaignInfluencer>): Promise<CampaignInfluencer> {
  try {
    const now = new Date().toISOString();
    
    const result = await sql`
      UPDATE campaign_influencers 
      SET 
        status = COALESCE(${data.status}, status),
        rate = COALESCE(${data.rate || null}, rate),
        performance_rating = COALESCE(${data.performanceRating || null}, performance_rating),
        deliverables = COALESCE(${JSON.stringify(data.deliverables)}, deliverables),
        performance = COALESCE(${JSON.stringify(data.performance)}, performance),
        notes = COALESCE(${data.notes}, notes),
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;
    
    const row = result[0];
    return {
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status,
      rate: row.rate ? parseFloat(row.rate) : undefined,
      performanceRating: row.performance_rating,
      deliverables: row.deliverables || [],
      performance: row.performance || {},
      notes: row.notes,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to update campaign influencer:', error);
    throw error;
  }
}

export async function removeInfluencerFromCampaign(campaignId: string, influencerId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM campaign_influencers 
      WHERE campaign_id = ${campaignId} AND influencer_id = ${influencerId}
    `;
  } catch (error) {
    console.error('Failed to remove influencer from campaign:', error);
    throw error;
  }
}

export async function getInfluencerCampaigns(influencerId: string): Promise<CampaignInfluencer[]> {
  try {
    const result = await sql`
      SELECT 
        ci.*,
        c.name as campaign_name,
        c.status as campaign_status,
        c.start_date,
        c.end_date
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ci.influencer_id = ${influencerId}
      ORDER BY ci.created_at DESC
    `;
    
    return result.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status,
      rate: row.rate ? parseFloat(row.rate) : undefined,
      performanceRating: row.performance_rating,
      deliverables: row.deliverables || [],
      performance: row.performance || {},
      notes: row.notes,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      campaign: {
        id: row.campaign_id,
        name: row.campaign_name,
        status: row.campaign_status,
        startDate: row.start_date?.toISOString(),
        endDate: row.end_date?.toISOString(),
      } as any,
    }));
  } catch (error) {
    console.error('Failed to fetch influencer campaigns:', error);
    throw error;
  }
} 