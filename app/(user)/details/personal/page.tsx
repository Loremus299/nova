import Container from "@/components/container";
import UserDetailsForm from "./form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Result from "@loremus299/pineapple";
import { DrizzleQueryError, eq } from "drizzle-orm";
import db from "@/lib/db";
import { userDetails, userDetailUrls } from "@/lib/db/schema";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Promise.resolve(
		await Result.tryCatch(
			async () =>
				db
					.select()
					.from(userDetails)
					.where(eq(userDetails.user, session.user.id)),
			DrizzleQueryError,
		),
	);

	const f2 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(userDetailUrls)
				.where(eq(userDetailUrls.user, session.user.id)),
		DrizzleQueryError,
	);

	const data = await Result.settle([f1, f2]);
	if (!data.outcome.success) return notFound();
	const [personal, url] = data.outcome.data;

	return (
		<Container>
			<div className="p-4 grid place-items-center min-h-screen">
				<main className="grid gap-1 tracking-tight">
					<h1 className="font-semibold">Personal Details</h1>
					<h2 className="mb-6 text-muted-foreground text-sm">
						These details will appear on your resumes. These details are case
						sensitive.
					</h2>
					<UserDetailsForm
						defaultValues={{
							name: personal[0]?.name ?? "",
							email: personal[0]?.email ?? "",
							phone: personal[0]?.phone ?? "",
							location: personal[0]?.location ?? undefined,
							urls: [
								...url.map((item) => ({ name: item.key, url: item.value })),
								{
									name: "GitHub",
									url: `https://github.com/${session.user.name}`,
								},
							],
						}}
					/>
				</main>
			</div>
		</Container>
	);
}
