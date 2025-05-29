import { pgTable, text, integer, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // This will store hashed passwords
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
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