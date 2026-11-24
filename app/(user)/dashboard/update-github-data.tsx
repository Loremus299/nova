"use client";

import LoadingButton from "@/components/badcn/loadingButton";
import { updateGithubDataAction } from "./action";
import { useState } from "react";
import { BotIcon } from "lucide-react";

export default function UpdateGithubData() {
	const [loading, setLoading] = useState(false);

	return (
		<LoadingButton
			onClick={async () => {
				setLoading(true);
				await updateGithubDataAction().finally(() => setLoading(false));
			}}
			loading={loading}
		>
			<BotIcon /> Update Github Data
		</LoadingButton>
	);
}
