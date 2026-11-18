import z from "zod";

export const userSchema = z.object({
	name: z.string().min(1).max(50),
	email: z.email(),
	phone: z.string().min(1),
	location: z.string().optional(),
	urls: z.array(z.object({ name: z.string(), url: z.url() })),
});

export const projectSchema = z.array(
	z.object({
		name: z.string(),
		description: z.string(),
		urls: z.record(z.string(), z.url()),
		tech: z.array(z.string()),
		highlights: z.array(z.object({ highlight: z.string() })).optional(),
	}),
);

export const experienceSchema = z.array(
	z.object({
		company: z.string(),
		role: z.string(),
		duration: z.string(),
		highlights: z.array(z.object({ highlight: z.string() })).optional(),
	}),
);

export const educationSchema = z.array(
	z.object({
		institution: z.string(),
		qualification: z.string(),
		duration: z.string(),
		grade: z.string().optional(),
		highlights: z.array(z.object({ highlight: z.string() })).optional(),
	}),
);

const resumeSchema = z.object({
	user: userSchema,
	role: z.string(),
	summary: z.string(),

	skills: z.record(z.string(), z.array(z.string())),
	projects: projectSchema,
	experience: experienceSchema,
	education: educationSchema,

	metadata: z.object({
		createdAt: z.iso.datetime(),
		company: z.object({ name: z.string(), role: z.string() }),
	}),
});

export default resumeSchema;
