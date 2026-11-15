import z from "zod";

export const userSchema = z.object({
	name: z.string(),
	email: z.email(),
	github: z.url(),
	phone: z.string().optional(),
	urls: z.record(z.string(), z.url()),
});

export const projectSchema = z.object({
	name: z.string(),
	description: z.string(),
	urls: z.record(z.string(), z.url()),
	tech: z.array(z.string()),
	highlights: z.array(z.string()),
});

export const experienceSchema = z.object({
	company: z.string(),
	role: z.string(),
	duration: z.string(),
	highlights: z.array(z.string()),
});

export const educationSchema = z.object({
	institution: z.string(),
	qualification: z.string(),
	duration: z.string(),
	grade: z.string().optional(),
	highlights: z.array(z.string()).optional(),
});

export const resumeSchema = z.object({
	user: userSchema,
	role: z.string(),
	summary: z.string(),

	skills: z.record(z.string(), z.array(z.string())),

	projects: z.array(projectSchema),

	experience: z.array(experienceSchema),

	education: z.array(educationSchema),

	metadata: z.object({
		createdAt: z.iso.datetime(),
		company: z.object({ name: z.string(), role: z.string() }),
	}),
});
