import z from "zod";

const resumeSchema = z.object({
	user: z.object({
		name: z.string(),
		email: z.email(),
		github: z.url(),
		phone: z.string().optional(),
		urls: z.record(z.string(), z.url()),
	}),
	role: z.string(),
	summary: z.string(),

	skills: z.record(z.string(), z.array(z.string())),
	projects: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
			urls: z.record(z.string(), z.url()),
			tech: z.array(z.string()),
			highlights: z.array(z.string()),
		}),
	),
	experience: z.array(
		z.object({
			company: z.string(),
			role: z.string(),
			duration: z.string(),
			highlights: z.array(z.string()),
		}),
	),
	education: z.array(
		z.object({
			institution: z.string(),
			qualification: z.string(),
			duration: z.string(),
			grade: z.string().optional(),
			highlights: z.array(z.string()).optional(),
		}),
	),

	metadata: z.object({
		createdAt: z.iso.datetime(),
		company: z.object({ name: z.string(), role: z.string() }),
	}),
});

export default resumeSchema;
