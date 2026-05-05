# Architecture Design - Test Ink Business

## Overview
Test Ink Business is a full-stack AI-powered business management system for tattoo shops. It handles bookings, lead generation, SMS communication, content planning, and CRM.

## Tech Stack
- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Supabase Auth](https://supabase.com/auth)
- **SMS/Calls:** [Twilio](https://www.twilio.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **AI:** [OpenAI](https://openai.com/) / [Anthropic](https://www.anthropic.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Infrastructure:** [Vercel](https://vercel.com/)

## Database Schema

### Tables

#### `artists`
- `id`: uuid (PK)
- `name`: text
- `email`: text (unique)
- `bio`: text
- `specialties`: text[]
- `avatar_url`: text
- `is_active`: boolean

#### `clients`
- `id`: uuid (PK)
- `name`: text
- `phone`: text (unique)
- `email`: text
- `instagram_handle`: text
- `birthday`: date
- `notes`: text
- `spend_level`: text (low, medium, high)
- `referral_source`: text
- `created_at`: timestamp

#### `appointments`
- `id`: uuid (PK)
- `client_id`: uuid (FK -> clients.id)
- `artist_id`: uuid (FK -> artists.id)
- `date_time`: timestamp
- `duration_minutes`: integer
- `style`: text
- `placement`: text
- `size`: text
- `description`: text
- `status`: text (pending, confirmed, completed, cancelled, no-show)
- `deposit_amount`: integer (cents)
- `deposit_status`: text (unpaid, paid, refunded)
- `stripe_payment_id`: text
- `created_at`: timestamp

#### `leads`
- `id`: uuid (PK)
- `name`: text
- `contact_info`: text
- `source`: text (web, instagram, facebook, google)
- `style_interest`: text
- `budget_range`: text
- `timeline`: text
- `status`: text (new, contacted, booked, lost)
- `score`: text (hot, warm, cold)
- `last_engagement`: timestamp
- `created_at`: timestamp

#### `missed_calls`
- `id`: uuid (PK)
- `phone_number`: text
- `timestamp`: timestamp
- `status`: text (new, contacted, booked, lost)
- `follow_up_sent`: boolean

#### `communications`
- `id`: uuid (PK)
- `type`: text (sms, instagram_dm, facebook_msg)
- `direction`: text (inbound, outbound)
- `contact_id`: uuid (Polymorphic/Reference to clients, leads, or missed_calls)
- `content`: text
- `timestamp`: timestamp

#### `reviews`
- `id`: uuid (PK)
- `appointment_id`: uuid (FK -> appointments.id)
- `rating`: integer
- `feedback`: text
- `is_public`: boolean
- `created_at`: timestamp

#### `content_posts`
- `id`: uuid (PK)
- `platform`: text (instagram, tiktok, facebook)
- `scheduled_date`: timestamp
- `content_type`: text (flash_sale, artist_spotlight, reveal, tips, testimonial)
- `caption`: text
- `hashtags`: text[]
- `status`: text (draft, scheduled, posted)
- `ai_generated`: boolean

## Key Modules

### 1. Booking & Availability
- Real-time calendar view for artists.
- Stripe integration for deposit collection.
- Automated care instructions PDF generation.

### 2. Automated Communication (Twilio)
- Missed call SMS auto-response.
- Appointment reminders (48h and 2h before).
- Post-appointment aftercare and review requests.
- Two-way SMS for rescheduling.

### 3. Lead Management & AI
- Instant auto-response to new leads.
- AI-driven lead scoring based on intent and budget.
- Multi-channel lead capture (Meta API).

### 4. Content Engine
- AI-generated content calendar based on shop trends.
- Automated caption and hashtag suggestions.

## Implementation Plan
1. **Phase 1:** Core infrastructure, Database schema, Auth.
2. **Phase 2:** Booking system & CRM.
3. **Phase 3:** Twilio integration & Missed call handler.
4. **Phase 4:** Lead generation & Meta API integration.
5. **Phase 5:** Content Engine & AI features.
6. **Phase 6:** Dashboard & Analytics.
