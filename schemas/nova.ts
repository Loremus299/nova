import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import z from "zod";

const projectSchema = z.object({
	name: z.string(),
	tagline: z.string(),
	description: z.object({
		project: z.string(),
		technical: z.string(),
	}),
	urls: z.record(z.string(), z.url()),
	tech: z.array(z.string()),
	highlights: z.array(z.string()),
	features: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
			implementation: z.string(),
			tech: z.array(z.string()),
		}),
	),
	status: z.enum(["in-development", "completed", "maintained", "archived"]),
	presentation: z.object({
		poster: z.url(),
		logo: z.url(),
	}),
});

export default projectSchema;

const schema = z.toJSONSchema(projectSchema, { target: "draft-2020-12" });
const output = resolve(process.cwd(), "public/nova.json");

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(schema, null, 2) + "\n", "utf-8");
