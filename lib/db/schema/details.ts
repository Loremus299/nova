import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userDetails = pgTable("resume_user_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull()
		.unique(),

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

export const userDetailUrls = pgTable(
	"resume_user_details_urls",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => globalThis.crypto.randomUUID()),
		user: text("user")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),

		key: text("key").notNull(),
		value: text("value").notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => [unique().on(t.user, t.key)],
);

export const educationTable = pgTable("resume_education_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),

	institution: text().notNull(),
	qualification: text().notNull(),
	duration: text().notNull(),
	grade: text().notNull(),
	highlights: text().array(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const experienceTable = pgTable("resume_experience_details", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => globalThis.crypto.randomUUID()),
	user: text("user")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),

	company: text().notNull(),
	role: text().notNull(),
	duration: text().notNull(),
	highlights: text().array(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
