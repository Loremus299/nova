import Container from "@/components/container";
import UserDetailsForm from "./form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/git-in");

	return (
		<Container>
			<div className="p-4 grid place-items-center min-h-screen">
				<main className="grid gap-1 tracking-tight">
					<h1 className="font-semibold">Personal Details</h1>
					<h2 className="mb-6 text-muted-foreground text-sm">
						These details will appear on your resumes. These details are case
						sensitive.
					</h2>
					<UserDetailsForm />
				</main>
			</div>
		</Container>
	);
}
