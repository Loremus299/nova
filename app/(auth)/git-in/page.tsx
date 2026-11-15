import Container from "@/components/container";
import Image from "next/image";
import Login from "./login";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (session) redirect("/dashboard");

	return (
		<Container>
			<main className="w-full h-full grid place-items-center">
				<div className="grid grid-cols-2 portrait:grid-cols-1 gap-4 w-full">
					<div className="landscape:border-r min-h-screen landscape:p-4">
						<h1 className="text-3xl font-bold tracking-tighter">Nova</h1>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, soluta
						eius? Mollitia perferendis quae quod rerum error esse temporibus
						sapiente sunt minus assumenda, illo vitae voluptates optio dolores
						impedit? Commodi.
					</div>
					<div className="grid place-items-center">
						<div className="grid gap-4 place-items-center">
							<div className="flex items-center gap-4">
								<Image
									alt="logo"
									src={"/logo.svg"}
									width={64}
									height={64}
									className="size-8"
								/>
								<h4 className="font-bold">
									Your Resume, tailored for your opportunities.
								</h4>
							</div>
							<Login />
							<p className="text-muted-foreground">
								One GitHub login stands between you and a better resume.
							</p>
						</div>
					</div>
				</div>
			</main>
		</Container>
	);
}
