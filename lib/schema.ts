import { pgTable, text, integer, timestamp, uuid, jsonb, boolean, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // This will store hashed passwords
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
  googleClientId: text('google_client_id'), // Google OAuth Client ID for Gmail API
  googleApiKey: text('google_api_key'), // Google API Key for Gmail API
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(), // Link to user who created the campaign
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: numeric('budget', { precision: 10, scale: 2 }), // Total campaign budget
  status: text('status').notNull().default('draft'), // draft, active, completed, cancelled
  briefUrl: text('brief_url'), // Link to campaign brief
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const campaignInfluencers = pgTable('campaign_influencers', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  influencerId: uuid('influencer_id').references(() => influencers.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull().default('contacted'), // contacted, confirmed, posted, paid
  rate: numeric('rate', { precision: 10, scale: 2 }), // Individual rate for this influencer
  performanceRating: integer('performance_rating'), // 1-5 rating
  deliverables: jsonb('deliverables').$type<Array<{
    type: string; // 'post', 'story', 'reel', 'video'
    description: string;
    completed: boolean;
    deliveredAt?: string;
    url?: string;
  }>>(),
  performance: jsonb('performance').$type<{
    impressions?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
    reach?: number;
    saves?: number;
    shares?: number;
  }>(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const influencers = pgTable('influencers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(), // Link to user
  handle: text('handle').notNull(),
  profileLink: text('profile_link'),
  followers: integer('followers').default(0),
  email: text('email'),
  rate: integer('rate').default(0),
  categories: text('categories').array(),
  tags: text('tags').array(),
  followersAge: text('followers_age'),
  followersSex: text('followers_sex'),
  engagementRate: integer('engagement_rate').default(0),
  platform: text('platform').default('Instagram'),
  brandsWorkedWith: text('brands_worked_with').array(),
  notes: jsonb('notes').$type<Array<{ id: string; content: string; date: string }>>(),
  files: jsonb('files').$type<Array<any>>(),
  messages: jsonb('messages').$type<Array<{
    id: string;
    direction: 'incoming' | 'outgoing';
    subject: string;
    content: string;
    date: string;
  }>>(),
  campaigns: jsonb('campaigns').$type<Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    payment: number;
    paymentStatus: string;
    performance: {
      impressions: number;
      engagement: number;
      clicks: number;
      conversions: number;
    };
    notes: string;
  }>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reminders = pgTable('reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(), // Link to user who created the reminder
  title: text('title').notNull(),
  description: text('description'),
  expirationDate: timestamp('expiration_date').notNull(),
  isExpired: boolean('is_expired').default(false),
  isCompleted: boolean('is_completed').default(false),
  type: text('type').notNull().default('general'), // 'general', 'influencer', 'campaign'
  
  // Related entity IDs (nullable based on type)
  influencerId: uuid('influencer_id').references(() => influencers.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  
  // Priority level
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high'
  
  // Additional metadata
  metadata: jsonb('metadata').$type<{
    tags?: string[];
    color?: string;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 