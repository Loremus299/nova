"use server";

import ActionError, { actionLogger } from "@/lib/action";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { githubTable } from "@/lib/db/schema";
import { githubService } from "@/services/github";
import Result, { ResultType } from "@loremus299/pineapple";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function updateGithubDataAction(): Promise<
	ResultType<null, ActionError>
> {
	const log = actionLogger();

	try {
		log.trace("auth check - start", null);
		const accounts = await auth.api.listUserAccounts({
			headers: await headers(),
		});
		const github = accounts.find((a) => a.providerId === "github");
		if (!github) {
			log.error("auth check - error", "No user account");
			return Result.error<null, ActionError>({
				error: "No User Account",
				requestId: log.id,
			}).type;
		}

		const tokenObject = await auth.api.getAccessToken({
			body: { accountId: github.id },
			headers: await headers(),
		});
		const token = tokenObject.accessToken;
		log.debug("auth check - token", token);
		log.trace("auth check - finished", null);

		log.trace("db delete  - start", null);
		(
			await Result.tryCatch(
				async () =>
					await db
						.delete(githubTable)
						.where(eq(githubTable.user, accounts.at(0)!.userId)),
				DrizzleQueryError,
			)
		).onError((e) =>
			log.error("db delete - error", { error: e, type: typeof e }),
		);
		log.trace("db delete  - finished", null);

		log.trace("github - start", null);
		(await githubService.githubRepos(token, log.nest("Github Service - repos")))
			.mapOk(async (t) => {
				const repos = (
					await githubService.fetchFiles(
						t,
						token,
						log.nest("Github Service - nova"),
					)
				).contents;

				await Result.tryCatch(
					async () =>
						await db
							.insert(githubTable)
							.values({ user: accounts.at(0)!.userId, githubData: repos }),
					DrizzleQueryError,
				);
			})
			.onError((e) =>
				log.error("github - error", { error: e, type: typeof e }),
			);

		log.trace("github - finished", null);

		return Result.ok<null, ActionError>(null).type;
	} finally {
		await log.dump();
	}
}
