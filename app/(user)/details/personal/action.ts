"use server";

import { userSchema } from "@/schemas";
import z from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Result, { ResultType } from "@loremus299/pineapple";
import ActionError, { actionLogger } from "@/lib/action";
import { DrizzleQueryError, eq } from "drizzle-orm";
import db from "@/lib/db";
import { userDetails, userDetailUrls } from "@/lib/db/schema";

export async function addPersonalDetails(
	values: z.infer<typeof userSchema>,
): Promise<ResultType<null, ActionError>> {
	const log = actionLogger();
	log.info("action", "add personal details");
	log.debug("values", values);

	try {
		log.trace("auth check - start", null);
		const session = await (
			await Result.tryCatch(
				async () => auth.api.getSession({ headers: await headers() }),
				Error,
			)
		)
			.mapError<ActionError>((error) => {
				log.error("auth check - error", { error, type: typeof error });
				return {
					error: "Could Not validate user session",
					requestId: log.id,
				};
			})
			.chainOk<typeof auth.$Infer.Session, ActionError>(async (t) => {
				if (!t) {
					log.error("auth check - error", "No active session");
					return Result.error<typeof auth.$Infer.Session, ActionError>({
						error: "No active session",
						requestId: log.id,
					});
				}
				return Result.ok<typeof auth.$Infer.Session, ActionError>(t);
			});

		if (!session.outcome.success) {
			log.info("response", session.outcome.error);
			return Result.error<null, ActionError>(session.outcome.error).type;
		}
		const sessionData = session.outcome.data;
		log.debug("session", sessionData);
		log.trace("auth check - finished", null);

		log.trace("db query - start", null);
		const query = await Result.tryCatch(
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

					for (const link of values.urls) {
						await tx.insert(userDetailUrls).values({
							key: link.name,
							value: link.url,
							user: sessionData.user.id,
						});
					}
				}),
			DrizzleQueryError,
		);
		if (!query.outcome.success) {
			log.error("db query - error", {
				error: query.outcome.error,
				type: typeof query.outcome.error,
			});
			log.info("response", "Could not add personal resume details");
			return Result.error<null, ActionError>({
				error: "Could not add personal resume details",
				requestId: log.id,
			}).type;
		}
		log.trace("db query - finished", null);
		log.info("response", null);
		return Result.ok<null, ActionError>(null).type;
	} finally {
		await log.dump();
	}
}
