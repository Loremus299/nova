import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "./db/index";
import * as schema from "./db/schema";
import Result from "@loremus299/pineapple";
import { DrizzleQueryError, eq } from "drizzle-orm";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			scope: ["repo"],
		},
	},
	databaseHooks: {
		account: {
			create: {
				async after(account) {
					if (account.providerId !== "github") return;

					await (
						await Result.tryCatch(
							async () =>
								await fetch("https://api.github.com/user", {
									headers: {
										Authorization: `Bearer ${account.accessToken}`,
										Accept: "application/vnd.github+json",
									},
								}),
							Error,
						)
					).chainOk(async (t) => {
						return Result.tryCatch(async () => {
							const { login } = await t.json();
							db.update(schema.user)
								.set({ name: login })
								.where(eq(schema.user.id, account.userId));
						}, DrizzleQueryError);
					});
				},
			},
		},
	},
});
