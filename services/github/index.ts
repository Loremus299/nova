import projectSchema from "@/schemas/nova";
import Result from "@loremus299/pineapple";
import Logger from "@loremus299/strawberry";
import z from "zod";

async function githubRepos(token: string, log: Logger) {
	const q = await (
		await Result.tryCatch(
			async () =>
				await fetch("https://api.github.com/user/repos?per_page=100", {
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: "application/vnd.github+json",
						"X-GitHub-Api-Version": "2022-11-28",
					},
					cache: "no-store",
				}),
			Error,
		)
	).chainOk<[{ full_name: string }], string>(async (t) => {
		if (!t.ok) return Result.error(t.statusText);
		return Result.ok((await t.json()) as [{ full_name: string }]);
	});

	log.debug("data", q);

	const res = q
		.mapError((e) => {
			log.error("error", { error: e, type: typeof e });
			return "Failed to fetch github repos";
		})
		.mapOk((t) => t.map((i) => i.full_name));

	return res;
}

async function fetchFiles(repos: string[], token: string, log: Logger) {
	const contents: z.infer<typeof projectSchema>[] = [];
	const errors: string[] = [];

	for (const repo of repos) {
		const q = (
			await (
				await Result.tryCatch(
					async () =>
						await fetch(
							`https://api.github.com/repos/${repo}/contents/nova.json`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
									Accept: "application/vnd.github.raw+json",
									"X-GitHub-Api-Version": "2022-11-28",
								},
								cache: "no-store",
							},
						),
					Error,
				)
			)
				.unrelated((r) => log.debug("result", r))
				.chainOk<z.infer<typeof projectSchema>, string>(async (t) => {
					if (t.ok) {
						const body = projectSchema.safeParse(await t.json());
						if (!body.success) return Result.error("Improper nova.json");
						return Result.ok(body.data);
					}
					return Result.error(t.statusText);
				})
		).mapError((e) => {
			log.error("error", { error: e, type: typeof e });
			return `Failed to read ${repo}'s nova.json`;
		});

		if (q.outcome.success) contents.push(q.outcome.data);
		else errors.push(q.outcome.error);
	}

	return { contents, errors };
}

export const githubService = {
	githubRepos,
	fetchFiles,
};
