"use server";

import ActionError, { actionLogger } from "@/lib/action";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { educationTable } from "@/lib/db/schema";
import { educationSchema } from "@/schemas";
import Result, { ResultType } from "@loremus299/pineapple";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export async function addEducationDetails(
	values: z.infer<typeof educationSchema>,
): Promise<ResultType<null, ActionError>> {
	const log = actionLogger();
	log.info("action", "add education details");
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
		const query = (
			await Result.tryCatch(
				async () =>
					await db.transaction(async (tx) => {
						await tx
							.delete(educationTable)
							.where(eq(educationTable.user, sessionData.user.id));
						for (const data of values) {
							await tx.insert(educationTable).values({
								user: sessionData.user.id,
								institution: data.institution,
								qualification: data.qualification,
								duration: data.duration,
								grade: data.grade,
								highlights: data.highlights
									? data.highlights.map((item) => item.highlight)
									: undefined,
							});
						}
					}),
				DrizzleQueryError,
			)
		).mapError<ActionError>((error) => {
			log.error("db query - error", { error, type: typeof error });
			return {
				error: "Could not add your educational details",
				requestId: log.id,
			};
		});
		if (!query.outcome.success)
			return Result.error<null, ActionError>({
				error: query.outcome.error.error,
				requestId: query.outcome.error.requestId,
			}).type;

		log.trace("db query - finished", null);
		return Result.ok<null, ActionError>(null).type;
	} finally {
		await log.dump();
	}
}
