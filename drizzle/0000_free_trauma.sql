CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	"date_time" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60,
	"style" text,
	"placement" text,
	"size" text,
	"description" text,
	"status" text DEFAULT 'pending',
	"deposit_amount" integer,
	"deposit_status" text DEFAULT 'unpaid',
	"stripe_payment_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"bio" text,
	"specialties" text[],
	"avatar_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "artists_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"instagram_handle" text,
	"birthday" date,
	"notes" text,
	"spend_level" text DEFAULT 'low',
	"referral_source" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "clients_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"contact_id" uuid NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"scheduled_date" timestamp,
	"content_type" text NOT NULL,
	"caption" text,
	"hashtags" text[],
	"status" text DEFAULT 'draft',
	"ai_generated" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_info" text NOT NULL,
	"source" text NOT NULL,
	"style_interest" text,
	"budget_range" text,
	"timeline" text,
	"status" text DEFAULT 'new',
	"score" text,
	"last_engagement" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "missed_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"status" text DEFAULT 'new',
	"follow_up_sent" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;