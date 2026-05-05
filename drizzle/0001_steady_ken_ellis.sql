ALTER TABLE "leads" ADD COLUMN "follow_up_step" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "last_follow_up_at" timestamp;