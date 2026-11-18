import Logger, { configureLogger } from "@loremus299/strawberry";

export default interface ActionError {
	error: string;
	requestId: string;
}

export function actionLogger() {
	configureLogger({
		prettyPrint: process.env.NODE_ENV === "development",
		async onDump(requestId, entries) {
			console.log("");
			console.log(requestId);
			for (const entry of entries) {
				if (entry.type == "debug") continue;

				console.log(
					`- [${entry.type}] ${entry.key} - ${JSON.stringify(entry.value)}`,
				);
			}
		},
	});
	return new Logger();
}
