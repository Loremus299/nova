"use server";

import { userSchema } from "@/schemas";
import z from "zod";
import Logger from "@loremus299/strawberry";
import Result, { ResultType } from "@loremus299/pineapple";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { userDetails, userDetailUrls } from "@/lib/db/schema";
import { headers } from "next/headers";

export default async function addUserDetails(
	values: z.infer<typeof userSchema>,
): Promise<ResultType<null, string>> {
	const log = new Logger();
	log.info("action", "add user details");
	log.debug("values", values);
	try {
		//-- USER SESSION
		log.trace("op", "user session");
		const session = (
			await Result.tryCatch(
				async () => await auth.api.getSession({ headers: await headers() }),
				Error,
			)
		).onError((e) => log.error("user session - error", e));

		if (!session.outcome.success)
			return Result.error<null, string>("Failed to get user session").type;
		if (!session.outcome.data) {
			log.warn("user session - warn", "User unauthenticated");
			return Result.error<null, string>("User unauthenticated").type;
		}
		const sessionData = session.outcome.data;
		log.debug("user session - debug", sessionData.user);
		log.trace("user session - success", null);
		//--

		//-- DB QUERY
		log.trace("op", "db query");
		const query = (
			await Result.tryCatch(
				async () =>
					db.transaction(async (tx) => {
						await tx
							.insert(userDetails)
							.values({
								user: sessionData.user.id,
								name: values.name,
								email: values.email,
								phone: values.phone,
								location: values.location,
							})
							.onConflictDoUpdate({
								target: userDetails.user,
								set: {
									name: values.name,
									email: values.email,
									phone: values.phone,
									location: values.location,
								},
							});

						await tx
							.delete(userDetailUrls)
							.where(eq(userDetailUrls.user, sessionData.user.id));

						for (const [key, value] of Object.entries(values.urls))
							await tx.insert(userDetailUrls).values({
								user: sessionData.user.id,
								key,
								value,
							});
					}),
				DrizzleQueryError,
			)
		).onError((e) => log.error("db query - error", e));

		if (!query.outcome.success)
			return Result.error<null, string>("Failed to add resume details").type;
		log.trace("db query - finished", null);
		//--

		log.trace("add user details - finished", null);
		return Result.ok<null, string>(null).type;
	} finally {
		await log.dump();
	}
}
