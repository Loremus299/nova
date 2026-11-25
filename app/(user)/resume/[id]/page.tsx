import Container from "@/components/container";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { resumeTable } from "@/lib/db/schema";
import resumeSchema from "@/schemas";
import Result from "@loremus299/pineapple";
import { DrizzleQueryError, eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react/jsx-runtime";
import z from "zod";
import ResumePdfClient from "./pdfClient";

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
							{Object.entries(resume.skills).map((item, index) => (
								<div key={index} className="flex">
									<p className="mt-1">
										<span className="text-foreground">{item[0]}</span> |{" "}
										{item[1].join(", ")}
									</p>
								</div>
							))}
						</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
					<div className="w-full grid gap-1">
						<h2 className="font-semibold">Experience</h2>
						<h4 className="text-xs text-muted-foreground">
							{resume.experience.map((item, index) => (
								<div key={index}>
									<div className="flex justify-between">
										<h5 className="text-foreground">{item.company}</h5>
										<p>{item.duration}</p>
									</div>
									<p>{item.role}</p>
									{item.highlights?.map((item, index) => (
										<div key={index} className="mt-1">
											- {item.highlight}
										</div>
									))}
								</div>
							))}
						</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
					<div className="w-full grid gap-1">
						<h2 className="font-semibold">Projects</h2>
						<h4 className="text-xs text-muted-foreground">
							{resume.projects.map((item, index) => (
								<div key={index}>
									<div className="flex justify-between">
										<h5 className="text-foreground">{item.name}</h5>
										<p>
											{Object.entries(item.urls).map((item, index) => (
												<Fragment key={index}>
													{index > 0 && " | "}
													<a
														key={index}
														target="_blank"
														className="underline"
														href={item[1]}
													>
														{item[0]}
													</a>
												</Fragment>
											))}
										</p>
									</div>
									<p>{item.description}</p>
									<p className="mt-2">{item.tech.join(", ")}</p>
									{item.highlights?.map((item, index) => (
										<div key={index} className="mt-1">
											- {item.highlight}
										</div>
									))}
								</div>
							))}
						</h4>
					</div>
					<div className="w-full h-1 border-t border-foreground" />
					<div className="w-full grid gap-1">
						<h2 className="font-semibold">Education</h2>
						<h4 className="text-xs text-muted-foreground">
							{resume.education.map((item, index) => (
								<div key={index}>
									<div className="flex justify-between">
										<h5 className="text-foreground">{item.qualification}</h5>
										<p>{item.duration}</p>
									</div>
									<p>
										{item.institution} ({item.grade})
									</p>
									{item.highlights?.map((item, index) => (
										<div key={index} className="mt-1">
											- {item.highlight}
										</div>
									))}
								</div>
							))}
						</h4>
					</div>
				</div>
				<div className="h-full">
					<ResumePdfClient resume={resume} />
				</div>
			</div>
		</Container>
	);
}
