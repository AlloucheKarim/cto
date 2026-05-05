import { pgTable, uuid, text, timestamp, integer, boolean, date, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Artists table
export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  bio: text('bio'),
  specialties: text('specialties').array(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clients table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').unique().notNull(),
  email: text('email'),
  instagramHandle: text('instagram_handle'),
  birthday: date('birthday'),
  notes: text('notes'),
  spendLevel: text('spend_level', { enum: ['low', 'medium', 'high'] }).default('low'),
  referralSource: text('referral_source'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  artistId: uuid('artist_id').references(() => artists.id).notNull(),
  dateTime: timestamp('date_time').notNull(),
  durationMinutes: integer('duration_minutes').default(60),
  style: text('style'),
  placement: text('placement'),
  size: text('size'),
  description: text('description'),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] }).default('pending'),
  depositAmount: integer('deposit_amount'), // in cents
  depositStatus: text('deposit_status', { enum: ['unpaid', 'paid', 'refunded'] }).default('unpaid'),
  stripePaymentId: text('stripe_payment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Leads table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contactInfo: text('contact_info').notNull(),
  source: text('source').notNull(), // web, instagram, facebook, google
  styleInterest: text('style_interest'),
  budgetRange: text('budget_range'),
  timeline: text('timeline'),
  status: text('status', { enum: ['new', 'contacted', 'booked', 'lost'] }).default('new'),
  score: text('score', { enum: ['hot', 'warm', 'cold'] }),
  lastEngagement: timestamp('last_engagement'),
  followUpStep: integer('follow_up_step').default(0),
  lastFollowUpAt: timestamp('last_follow_up_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Missed calls table
export const missedCalls = pgTable('missed_calls', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  status: text('status', { enum: ['new', 'contacted', 'booked', 'lost'] }).default('new'),
  followUpSent: boolean('follow_up_sent').default(false),
});

// Communications table (for SMS, DMs)
export const communications = pgTable('communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // sms, instagram_dm, facebook_msg
  direction: text('direction').notNull(), // inbound, outbound
  contactId: uuid('contact_id').notNull(), // Can be client, lead, or missed call ID
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').references(() => appointments.id).notNull(),
  rating: integer('rating').notNull(),
  feedback: text('feedback'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Content posts table
export const contentPosts = pgTable('content_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(), // instagram, tiktok, facebook
  scheduledDate: timestamp('scheduled_date'),
  contentType: text('content_type').notNull(), // flash_sale, artist_spotlight, reveal, tips, testimonial
  caption: text('caption'),
  hashtags: text('hashtags').array(),
  status: text('status', { enum: ['draft', 'scheduled', 'posted'] }).default('draft'),
  aiGenerated: boolean('ai_generated').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  artist: one(artists, {
    fields: [appointments.artistId],
    references: [artists.id],
  }),
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
}));
