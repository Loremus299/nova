"use server";

import z from "zod";
import { newResumeSchema } from "./form";
import ActionError, { actionLogger } from "@/lib/action";
import Result, { ResultType } from "@loremus299/pineapple";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DrizzleQueryError, eq } from "drizzle-orm";
import db from "@/lib/db";
import {
	educationTable,
	experienceTable,
	githubTable,
	userDetails,
	userDetailUrls,
} from "@/lib/db/schema";
import { llmService } from "@/services/openrouter";

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

		log.trace("db data - start", null);
		const data = (
			await Result.tryCatch(
				async () =>
					db.transaction(async (tx) => {
						return {
							github: (
								await tx
									.select()
									.from(githubTable)
									.where(eq(githubTable.user, sessionData.user.id))
							).at(0),
							personal: await tx
								.select()
								.from(userDetails)
								.where(eq(userDetails.user, sessionData.user.id)),
							urls: await tx
								.select()
								.from(userDetailUrls)
								.where(eq(userDetailUrls.user, sessionData.user.id)),
							experience: await tx
								.select()
								.from(experienceTable)
								.where(eq(experienceTable.user, sessionData.user.id)),
							education: await tx
								.select()
								.from(educationTable)
								.where(eq(educationTable.user, sessionData.user.id)),
						};
					}),
				DrizzleQueryError,
			)
		).onError((e) =>
			log.error("db data - error", { error: e, type: typeof e }),
		);

		if (!data.outcome.success)
			return Result.error<null, ActionError>({
				error: "Failed to get user resume data",
				requestId: log.id,
			}).type;

		const userData = data.outcome.data;
		log.debug("db data", userData);
		log.trace("db data - finished", null);

		log.trace("AI Service - start", null);
		const resume = (
			await (
				await llmService.analyzeJobDescription(
					values.description,
					log.nest("LLM - analyze JD"),
				)
			).chainOk(async (t) =>
				(
					await llmService.tailorProjects(
						userData.github?.githubData,
						t.output,
						log.nest("LLM - tailor projects"),
					)
				).chainOk(
					async (r) =>
						await llmService.tailorResume(
							r.output,
							{
								personal: {
									name: userData.personal.at(0)!.name,
									email: userData.personal.at(0)!.email,
									phone: userData.personal.at(0)!.phone,
									location: userData.personal.at(0)!.location ?? undefined,
									urls: userData.urls.map((item) => ({
										name: item.key,
										url: item.value,
									})),
								},
								education: userData.education.map((item) => ({
									institution: item.institution,
									qualification: item.qualification,
									duration: item.duration,
									grade: item.grade,
									highlights: item.highlights?.map((highlight) => ({
										highlight,
									})),
								})),
								experience: userData.experience.map((item) => ({
									company: item.company,
									duration: item.duration,
									role: item.role,
									highlights: item.highlights?.map((highlight) => ({
										highlight,
									})),
								})),
							},
							t.output,
							log.nest(""),
						),
				),
			)
		).onError((e) =>
			log.error("AI Service - error", { error: e, type: typeof e }),
		);

		if (!resume.outcome.success)
			return Result.error<null, ActionError>({
				error: resume.outcome.error,
				requestId: log.id,
			}).type;
		log.trace("AI Service - finished", null);

		return Result.ok<null, ActionError>(null).type;
	} finally {
		await log.dump();
	}
}
