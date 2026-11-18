CREATE TABLE "resume_education_details" (
	"id" text PRIMARY KEY,
	"institution" text NOT NULL,
	"qualification" text NOT NULL,
	"duration" text NOT NULL,
	"grade" text NOT NULL,
	"highlights" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
