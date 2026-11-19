CREATE TABLE "user_resumes" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"posting" text NOT NULL,
	"host" text NOT NULL,
	"resume_schema" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE CASCADE;