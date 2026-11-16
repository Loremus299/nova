import z from "zod";

const projectSchema = z.object({
	name: z.string(),
	tagline: z.string(),
	description: z.string(),
	urls: z.record(z.string(), z.url()),
	tech: z.array(z.string()),
	highlights: z.array(z.string()),
});

export default projectSchema;
