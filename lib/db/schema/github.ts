import { json, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const githubTable = pgTable("github_table", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull()
		.unique(),

	githubData: json("github_data").notNull(),
});
