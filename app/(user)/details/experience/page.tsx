import Container from "@/components/container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ExperienceDetailsForm from "./form";
import Result from "@loremus299/pineapple";
import { experienceTable } from "@/lib/db/schema";
import { DrizzleQueryError, eq } from "drizzle-orm";
import db from "@/lib/db";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(experienceTable)
				.where(eq(experienceTable.user, session.user.id)),
		DrizzleQueryError,
	);

	const data = await Result.settle([f1]);
	if (!data.outcome.success) return notFound();
	const [experience] = data.outcome.data;

	return (
		<Container>
			<div className="p-4 grid place-items-center min-h-screen">
				<main className="grid gap-1 tracking-tight">
					<h1 className="font-semibold">Experience Details</h1>
					<h2 className="mb-6 text-muted-foreground text-sm">
						These details will appear on your resumes. These details are case
						sensitive.
					</h2>
					<ExperienceDetailsForm
						defaultValues={experience.map((item) => ({
							company: item.company,
							role: item.role,
							duration: item.duration,
							highlights: item.highlights?.map((highlight) => ({
								highlight,
							})),
						}))}
					/>
				</main>
			</div>
		</Container>
	);
}
