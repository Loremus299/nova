import jobSchema from "@/schemas/job";
import Result from "@loremus299/pineapple";
import Logger from "@loremus299/strawberry";
import { OpenRouter } from "@openrouter/sdk";
import { readFileSync } from "fs";
import z from "zod";

const openRouter = new OpenRouter({
	appTitle: "Nova",
	appCategories: "writing-assistant",
	apiKey: process.env.OPENROUTER_KEY!,
});

type AnalyzeJDSuccess = { model: string; output: z.infer<typeof jobSchema> };

export async function analyzeJobDescription(
	job: string,
	log: Logger,
): Promise<Result<AnalyzeJDSuccess, string>> {
	return (
		await Result.tryCatch(
			async () =>
				await openRouter.chat.send({
					chatRequest: {
						messages: [
							{
								role: "system",
								content: readFileSync(
									process.cwd() + "/openrouter/prompts/analyze-job.md",
									"utf-8",
								),
							},
							{ role: "user", content: job },
						],
					},
				}),
			Error,
		)
	)
		.unrelated(() => log.debug("job description", job))
		.mapError((error) => {
			log.error("AI error - openrouter failure", { error, type: typeof error });
			return "The AI failed to parse job description.";
		})
		.chainOk<AnalyzeJDSuccess, string>(async (t) => {
			const content = t.choices[0]?.message.content;

			if (typeof content !== "string") {
				return Result.error("The AI returned an empty response.");
			}

			let parsed: unknown;

			try {
				parsed = JSON.parse(content);
			} catch {
				log.error("AI error - invalid JSON", content);
				return Result.error("The AI returned invalid JSON.");
			}

			const data = jobSchema.safeParse(parsed);
			if (!data.success) {
				log.error(
					"AI error - inappropriate response",
					t.choices[0].message.content as string,
				);
				return Result.error("The AI returned an inappropriate response.");
			}

			return Result.ok({
				model: t.model,
				output: data.data,
			});
		});
}
