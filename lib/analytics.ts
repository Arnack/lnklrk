import { sql } from './db';

export interface AnalyticsData {
  totalReach: number;
  totalReachChange: number;
  averageEngagementRate: number;
  engagementRateChange: number;
  totalROI: number;
  roiChange: number;
  activeCampaigns: number;
  totalCampaigns: number;
  totalSpend: number;
  totalInfluencers: number;
  monthlyPerformance: Array<{
    month: string;
    campaigns: number;
    spend: number;
    reach: number;
    engagement: number;
  }>;
  campaignStatusDistribution: Array<{
    status: string;
    count: number;
    value: number;
  }>;
  topPerformingCampaigns: Array<{
    id: string;
    name: string;
    reach: number;
    engagement: number;
    roi: number;
    status: string;
  }>;
  platformDistribution: Array<{
    platform: string;
    count: number;
    reach: number;
  }>;
}

function generateSampleData(): AnalyticsData {
  const currentDate = new Date();
  const monthlyData = [];
  
  // Generate 6 months of zero data
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = date.toISOString().substring(0, 7);
    monthlyData.push({
      month,
      campaigns: 0,
      spend: 0,
      reach: 0,
      engagement: 0,
    });
  }

  return {
    totalReach: 0,
    totalReachChange: 0,
    averageEngagementRate: 0,
    engagementRateChange: 0,
    totalROI: 0,
    roiChange: 0,
    activeCampaigns: 0,
    totalCampaigns: 0,
    totalSpend: 0,
    totalInfluencers: 0,
    monthlyPerformance: monthlyData,
    campaignStatusDistribution: [],
    topPerformingCampaigns: [],
    platformDistribution: [],
  };
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  try {
    // Get current period data (last 30 days)
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    
    // Get previous period data (30-60 days ago) for comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);

    // Total reach and engagement
    const reachEngagementResult = await sql`
      SELECT 
        SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) as total_reach,
        AVG(COALESCE((ci.performance->>'engagement')::numeric, 0)) as avg_engagement,
        COUNT(DISTINCT c.id) as total_campaigns,
        SUM(COALESCE(ci.rate, 0)) as total_spend,
        COUNT(DISTINCT ci.influencer_id) as total_influencers
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE c.user_id = ${userId}
    `;

    // If no campaigns exist, return sample data
    if (!reachEngagementResult.length || Number(reachEngagementResult[0].total_campaigns) === 0) {
      return generateSampleData();
    }

    // Previous period comparison
    const previousPeriodResult = await sql`
      SELECT 
        SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) as prev_total_reach,
        AVG(COALESCE((ci.performance->>'engagement')::numeric, 0)) as prev_avg_engagement
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE c.user_id = ${userId}
        AND c.created_at >= ${previousPeriodStart.toISOString()}
        AND c.created_at < ${currentPeriodStart.toISOString()}
    `;

    // Active campaigns
    const activeCampaignsResult = await sql`
      SELECT COUNT(*) as active_campaigns
      FROM campaigns c
      WHERE c.user_id = ${userId} AND c.status = 'active'
    `;

    // Monthly performance data
    const monthlyPerformanceResult = await sql`
      SELECT 
        TO_CHAR(c.created_at, 'YYYY-MM') as month,
        COUNT(DISTINCT c.id) as campaigns,
        SUM(COALESCE(ci.rate, 0)) as spend,
        SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) as reach,
        SUM(COALESCE((ci.performance->>'engagement')::numeric, 0)) as engagement
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE c.user_id = ${userId}
        AND c.created_at >= ${new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()}
      GROUP BY TO_CHAR(c.created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `;

    // Campaign status distribution
    const statusDistributionResult = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM campaigns
      WHERE user_id = ${userId}
      GROUP BY status
    `;

    // Top performing campaigns
    const topCampaignsResult = await sql`
      SELECT 
        c.id,
        c.name,
        c.status,
        SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) as reach,
        SUM(COALESCE((ci.performance->>'engagement')::numeric, 0)) as engagement,
        SUM(COALESCE(ci.rate, 0)) as spend
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name, c.status
      HAVING SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) > 0
      ORDER BY reach DESC
      LIMIT 5
    `;

    // Platform distribution
    const platformDistributionResult = await sql`
      SELECT 
        i.platform,
        COUNT(DISTINCT i.id) as count,
        SUM(COALESCE((ci.performance->>'reach')::numeric, 0)) as reach
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE c.user_id = ${userId}
      GROUP BY i.platform
      ORDER BY count DESC
    `;

    const currentData = reachEngagementResult[0];
    const prevData = previousPeriodResult[0] || { prev_total_reach: 0, prev_avg_engagement: 0 };

    const totalReach = Number(currentData.total_reach) || 0;
    const prevTotalReach = Number(prevData.prev_total_reach) || 0;
    const avgEngagement = Number(currentData.avg_engagement) || 0;
    const prevAvgEngagement = Number(prevData.prev_avg_engagement) || 0;
    const totalSpend = Number(currentData.total_spend) || 0;

    // Calculate ROI (simplified as reach per dollar spent)
    const roi = totalSpend > 0 ? totalReach / totalSpend : 0;
    const prevRoi = totalSpend > 0 ? prevTotalReach / totalSpend : 0;

    return {
      totalReach,
      totalReachChange: prevTotalReach > 0 ? ((totalReach - prevTotalReach) / prevTotalReach) * 100 : 0,
      averageEngagementRate: avgEngagement,
      engagementRateChange: prevAvgEngagement > 0 ? ((avgEngagement - prevAvgEngagement) / prevAvgEngagement) * 100 : 0,
      totalROI: roi,
      roiChange: prevRoi > 0 ? ((roi - prevRoi) / prevRoi) * 100 : 0,
      activeCampaigns: Number(activeCampaignsResult[0].active_campaigns) || 0,
      totalCampaigns: Number(currentData.total_campaigns) || 0,
      totalSpend,
      totalInfluencers: Number(currentData.total_influencers) || 0,
      monthlyPerformance: monthlyPerformanceResult.length > 0 
        ? monthlyPerformanceResult.map(row => ({
            month: row.month,
            campaigns: Number(row.campaigns),
            spend: Number(row.spend) || 0,
            reach: Number(row.reach) || 0,
            engagement: Number(row.engagement) || 0,
          })).reverse()
        : generateSampleData().monthlyPerformance,
      campaignStatusDistribution: statusDistributionResult.map(row => ({
        status: row.status,
        count: Number(row.count),
        value: Number(row.count),
      })),
      topPerformingCampaigns: topCampaignsResult.map(row => ({
        id: row.id,
        name: row.name,
        reach: Number(row.reach) || 0,
        engagement: Number(row.engagement) || 0,
        roi: Number(row.spend) > 0 ? Number(row.reach) / Number(row.spend) : 0,
        status: row.status,
      })),
      platformDistribution: platformDistributionResult.map(row => ({
        platform: row.platform,
        count: Number(row.count),
        reach: Number(row.reach) || 0,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    // Return sample data on error
    return generateSampleData();
  }
} 