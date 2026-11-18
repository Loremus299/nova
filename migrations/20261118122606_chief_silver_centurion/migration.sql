CREATE TABLE "resume_experience_details" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"duration" text NOT NULL,
	"highlights" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_experience_details" ADD CONSTRAINT "resume_experience_details_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE CASCADE;