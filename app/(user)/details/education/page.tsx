import Container from "@/components/container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EducationDetailsForm from "./form";
import Result from "@loremus299/pineapple";
import db from "@/lib/db";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { educationTable } from "@/lib/db/schema";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(educationTable)
				.where(eq(educationTable.user, session.user.id)),
		DrizzleQueryError,
	);

	const data = await Result.settle([f1]);
	if (!data.outcome.success) return notFound();
	const [education] = data.outcome.data;

	return (
		<Container>
			<div className="p-4 grid place-items-center min-h-screen">
				<main className="grid gap-1 tracking-tight">
					<h1 className="font-semibold">Education Details</h1>
					<h2 className="mb-6 text-muted-foreground text-sm">
						These details will appear on your resumes. These details are case
						sensitive.
					</h2>
					<EducationDetailsForm
						defaultValues={education.map((item) => ({
							duration: item.duration,
							grade: item.grade,
							institution: item.institution,
							qualification: item.qualification,
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
