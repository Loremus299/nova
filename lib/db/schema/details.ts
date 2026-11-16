import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userDetails = pgTable("resume_user_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id)
		.notNull(),

	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	location: text("location"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const userDetailUrls = pgTable("resume_user_details_urls", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id)
		.notNull(),

	key: text("key").notNull(),
	value: text("value").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
