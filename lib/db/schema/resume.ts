import { json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const resumeTable = pgTable("user_resumes", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),

	posting: text("posting").notNull(),
	resume: json("resume_schema").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
