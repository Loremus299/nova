import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import UpdateGithubData from "./update-github-data";
import Container from "@/components/container";
import Result from "@loremus299/pineapple";
import { resumeTable } from "@/lib/db/schema";
import db from "@/lib/db";
import { DrizzleQueryError, eq } from "drizzle-orm";
import resumeSchema from "@/schemas";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Promise.resolve(
		(
			await Result.tryCatch(
				async () =>
					db
						.select()
						.from(resumeTable)
						.where(eq(resumeTable.user, session.user.id)),
				DrizzleQueryError,
			)
		).mapOk((t) =>
			t.map((item) => ({ ...item, resume: resumeSchema.parse(item.resume) })),
		),
	);

	const data = await Result.settle([f1]);
	if (!data.outcome.success) return notFound();
	const [resumes] = data.outcome.data;

	return (
		<Container>
			<div className="w-full p-4 grid gap-4">
				<div>
					<UpdateGithubData />
				</div>
				<div className="grid gap-4">
					{resumes.map((item, index) => (
						<Card key={index}>
							<CardHeader>
								<CardTitle>{item.resume.role}</CardTitle>
								<CardDescription>{item.resume.summary}</CardDescription>
								<CardAction>
									<Link href={`/resume/${item.id}`} target="_blank">
										<ExternalLink className="size-4" />
									</Link>
								</CardAction>
							</CardHeader>
							<CardContent>
								<Link href={item.posting} target="_blank" className="underline">
									{item.posting}
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</Container>
	);
}
