import resumeSchema, {
	educationSchema,
	experienceSchema,
	projectSchema,
	userSchema,
} from "@/schemas";
import jobSchema from "@/schemas/job";
import novaSchema from "@/schemas/nova";
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
						model: "openrouter/auto",
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
				log.error("AI error - inappropriate response", data.error.issues);
				return Result.error("The AI returned an inappropriate response.");
			}

			return Result.ok({
				model: t.model,
				output: data.data,
			});
		});
}

type TailorProject = { model: string; output: z.infer<typeof projectSchema> };

export async function tailorProjects(
	projects: Array<z.infer<typeof novaSchema>>,
	job: z.infer<typeof jobSchema>,
	log: Logger,
): Promise<Result<TailorProject, string>> {
	return (
		await Result.tryCatch(
			async () =>
				openRouter.chat.send({
					chatRequest: {
						model: "openrouter/auto",
						messages: [
							{
								role: "system",
								content: readFileSync(
									process.cwd() + "/openrouter/prompts/tailor-project.md",
									"utf-8",
								),
							},
							{ role: "user", content: JSON.stringify(job) },
							{ role: "user", content: JSON.stringify(projects) },
						],
					},
				}),
			Error,
		)
	)
		.unrelated(() => log.debug("job and projects", { job, projects }))
		.mapError((error) => {
			log.error("AI error - openrouter failure", { error, type: typeof error });
			return "The AI failed to tailor projects for your resume.";
		})
		.chainOk(async (t) => {
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

			const data = projectSchema.safeParse(parsed);
			if (!data.success) {
				log.error("AI error - inappropriate response", data.error.issues);
				return Result.error("The AI returned an inappropriate response.");
			}

			return Result.ok({
				model: t.model,
				output: data.data,
			});
		});
}

const tailorResumeSchema = resumeSchema.omit({ metadata: true });
type TailorResume = {
	model: string;
	output: z.infer<typeof tailorResumeSchema>;
};

export async function tailorResume(
	projects: z.infer<typeof projectSchema>,
	profile: {
		personal: z.infer<typeof userSchema>;
		experience: z.infer<typeof experienceSchema>;
		education: z.infer<typeof educationSchema>;
	},
	job: z.infer<typeof jobSchema>,
	log: Logger,
): Promise<Result<TailorResume, string>> {
	return (
		await Result.tryCatch(
			async () =>
				openRouter.chat.send({
					chatRequest: {
						model: "openrouter/auto",
						messages: [
							{
								role: "system",
								content: readFileSync(
									process.cwd() + "/openrouter/prompts/tailor-resume.md",
									"utf-8",
								),
							},
							{ role: "user", content: JSON.stringify(job) },
							{ role: "user", content: JSON.stringify(profile) },
							{ role: "user", content: JSON.stringify(projects) },
						],
					},
				}),
			Error,
		)
	)
		.unrelated(() =>
			log.debug("job, projects and profile", { job, projects, profile }),
		)
		.mapError((error) => {
			log.error("AI error - openrouter failure", { error, type: typeof error });
			return "The AI failed to tailor your resume.";
		})
		.chainOk(async (t) => {
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

			const data = tailorResumeSchema.safeParse(parsed);
			if (!data.success) {
				log.error("AI error - inappropriate response", data.error.issues);
				return Result.error("The AI returned an inappropriate response.");
			}

			return Result.ok({
				model: t.model,
				output: data.data,
			});
		});
}
