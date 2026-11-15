"use client";

import LoadingButton from "@/components/badcn/loadingButton";
import { authClient } from "@/lib/auth-client";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function Login() {
	const [loading, setLoading] = useState(false);

	const signIn = async () => {
		setLoading(true);
		await authClient.signIn
			.social({
				provider: "github",
			})
			.then(() => setLoading(false));
	};

	return (
		<LoadingButton loading={loading} className={"w-full"} onClick={signIn}>
			<ArrowUpRight />
			Let&apos;s git in
		</LoadingButton>
	);
}
