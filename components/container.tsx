import type { ReactNode } from "react";

export default function Container({ children }: { children: ReactNode }) {
	return (
		<div className="w-screen min-h-screen flex justify-center dark portrait:p-4">
			<main className="w-full max-w-6xl">{children}</main>
		</div>
	);
}
