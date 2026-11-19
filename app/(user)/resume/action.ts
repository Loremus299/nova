"use server";

import z from "zod";
import { newResumeSchema } from "./form";
import ActionError, { actionLogger } from "@/lib/action";
import Result, { ResultType } from "@loremus299/pineapple";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function tailorNewResume(
	values: z.infer<typeof newResumeSchema>,
): Promise<ResultType<null, ActionError>> {
	const log = actionLogger();
	log.info("action", "tailor new resume");
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

		return Result.ok<null, ActionError>(null).type;
	} finally {
		await log.dump();
	}
}
