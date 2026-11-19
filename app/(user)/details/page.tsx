import Container from "@/components/container";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import {
	educationTable,
	experienceTable,
	userDetails,
	userDetailUrls,
} from "@/lib/db/schema";
import Result from "@loremus299/pineapple";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { ArrowRight, ExternalLink } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	const f1 = Promise.resolve(
		(
			await Result.tryCatch(
				async () =>
					db
						.select()
						.from(userDetails)
						.where(eq(userDetails.user, session.user.id)),
				DrizzleQueryError,
			)
		).one(),
	);

	const f2 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(userDetailUrls)
				.where(eq(userDetailUrls.user, session.user.id)),
		DrizzleQueryError,
	);

	const f3 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(experienceTable)
				.where(eq(experienceTable.user, session.user.id)),
		DrizzleQueryError,
	);

	const f4 = Result.tryCatch(
		async () =>
			db
				.select()
				.from(educationTable)
				.where(eq(educationTable.user, session.user.id)),
		DrizzleQueryError,
	);

	const data = await Result.settle([f1, f2, f3, f4]);
	if (!data.outcome.success) return notFound();
	const [personal, links, experience, education] = data.outcome.data;

	return (
		<Container>
			<div className="p-4 min-h-screen flex flex-col gap-4">
				<main className="border p-4 grid gap-1">
					<div className="flex items-center justify-between">
						<h4 className="font-serif mb-4">Personal Details</h4>
						<Link
							href={"/details/personal"}
							className={buttonVariants({ size: "xs" })}
						>
							<ArrowRight />
							Edit
						</Link>
					</div>
					<h1 className="text-3xl tracking-tight font-semibold mb-2">
						{personal.name}
					</h1>
					<h2 className="text-muted-foreground text-sm">
						{personal.email} | {personal.phone}
					</h2>
					{personal.location && (
						<h2 className="text-muted-foreground text-sm">
							{personal.location}
						</h2>
					)}
					<div className="mt-2 flex gap-8 flex-wrap">
						{links.map((item) => (
							<a
								href={item.value}
								target="_blank"
								key={item.id}
								className="flex gap-2 items-center underline"
							>
								<ExternalLink className="size-4" />
								{item.key}
							</a>
						))}
					</div>
				</main>
				<main className="border p-4 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h4 className="font-serif mb-4">Experience Details</h4>
						<Link
							href={"/details/experience"}
							className={buttonVariants({ size: "xs" })}
						>
							<ArrowRight />
							Edit
						</Link>
					</div>
					{experience.map((item) => (
						<div key={item.id} className="border border-dashed p-4">
							<h1 className="text-xl tracking-tight font-semibold">
								{item.company}
							</h1>
							<h2 className="text-muted-foreground text-sm mb-2">
								{item.role} ({item.duration})
							</h2>
							{item.highlights?.map((item) => (
								<div key={item} className="text-sm mt-2">
									<p>- {item}</p>
								</div>
							))}
						</div>
					))}
				</main>
				<main className="border p-4 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h4 className="font-serif mb-4">Education Details</h4>
						<Link
							href={"/details/education"}
							className={buttonVariants({ size: "xs" })}
						>
							<ArrowRight />
							Edit
						</Link>
					</div>
					{education.map((item) => (
						<div key={item.id} className="border border-dashed p-4">
							<h1 className="text-xl tracking-tight font-semibold">
								{item.institution}
							</h1>
							<h2 className="text-muted-foreground text-sm mb-2">
								{item.qualification} ({item.duration}) | {item.grade}
							</h2>
							{item.highlights?.map((item) => (
								<div key={item} className="text-sm mt-2">
									<p>- {item}</p>
								</div>
							))}
						</div>
					))}
				</main>
			</div>
		</Container>
	);
}
