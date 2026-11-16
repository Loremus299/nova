CREATE TABLE "resume_user_details_urls" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_user_details" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_user_details_urls" ADD CONSTRAINT "resume_user_details_urls_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "resume_user_details" ADD CONSTRAINT "resume_user_details_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id");