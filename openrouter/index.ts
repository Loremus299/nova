import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
	appTitle: "Nova",
	appCategories: "writing-assistant",
	apiKey: process.env.OPENROUTER_KEY!,
});
export default openRouter;
