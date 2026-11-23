CREATE TABLE "github_table" (
	"id" text PRIMARY KEY,
	"user" text NOT NULL UNIQUE,
	"github_data" json NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_table" ADD CONSTRAINT "github_table_user_user_id_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE CASCADE;