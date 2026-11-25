import Container from "@/components/container";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { resumeTable } from "@/lib/db/schema";
import resumeSchema from "@/schemas";
import Result from "@loremus299/pineapple";
import { DrizzleQueryError, eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import z from "zod";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Promise.resolve(
		(
			await Result.tryCatch(
				async () =>
					db
						.select()
						.from(resumeTable)
						.where(
							and(
								eq(resumeTable.id, id),
								eq(resumeTable.user, session.user.id),
							),
						),
				DrizzleQueryError,
			)
		)
			.one()
			.chainOk<z.infer<typeof resumeSchema>, string>(async (r) => {
				const parsedDetails = resumeSchema.safeParse(r.resume);
				if (parsedDetails.success) return Result.ok(parsedDetails.data);
				return Result.error("");
			}),
	);

	const data = await Result.settle([f1]);
	if (!data.outcome.success) return notFound();
	const [resume] = data.outcome.data;

	return (
		<Container>
			<div className="p-4 min-h-screen grid grid-cols-2 portrait:grid-cols-1 gap-4 text-sm">
				<div className="h-full flex flex-col gap-2">
					<div className="w-full grid gap-1">
						<h1 className="text-xl tracking-tight font-semibold place-self-center">
							{resume.user.name}
						</h1>
						<h4 className="text-xs text-muted-foreground place-self-center">
							{resume.user.email} | {resume.user.phone}{" "}
							{resume.user.location ? `| ${resume.user.location}` : null}
							{resume.user.urls.map((item, index) => (
								<span key={index}>
									|{" "}
									<a href={item.url} target="_blank" className="underline">
										{item.name}
									</a>{" "}
								</span>
							))}
						</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
					<div className="w-full grid gap-1">
						<h2 className="font-semibold">{resume.role}</h2>
						<h4 className="text-xs text-muted-foreground">{resume.summary}</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
					<div className="w-full grid gap-1">
						<h2 className="font-semibold">Skills</h2>
						<h4 className="text-xs text-muted-foreground">
							{Object.entries(resume.skills).map((item) => (
								<div key={item[0]} className="flex">
									{item[0]} | {item[1].join(", ")}
								</div>
							))}
						</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
				</div>
				<div className="h-full"></div>
			</div>
		</Container>
	);
}
