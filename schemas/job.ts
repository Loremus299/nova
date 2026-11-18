import { z } from "zod";

const requirementSchema = z.object({
	description: z.string(),
	priority: z.enum(["required", "preferred", "unspecified"]),
});

const technologySchema = z.object({
	name: z.string(),
	category: z.enum([
		"language",
		"framework",
		"library",
		"database",
		"tool",
		"platform",
		"other",
	]),
	source: z.enum(["explicit", "inferred"]),
});

const jobSchema = z.object({
	company: z.object({
		name: z.string().nullable(),
		description: z.string().nullable(),
		industry: z.string().nullable(),
		products: z.array(z.string()),
		targetAudience: z.array(z.string()),
		marketPositioning: z.string().nullable(),
	}),

	role: z.object({
		title: z.string().nullable(),
		description: z.string().nullable(),
		seniority: z.string().nullable(),
	}),

	responsibilities: z.array(z.string()),

	requirements: z.object({
		technical: z.array(requirementSchema),
		softSkills: z.array(requirementSchema),
		experience: z.array(requirementSchema),
		education: z.array(requirementSchema),
		certifications: z.array(requirementSchema),
		other: z.array(requirementSchema),
	}),

	technologies: z.array(technologySchema),

	application: z.object({
		contacts: z.array(
			z.object({
				type: z.enum(["email", "website", "form", "other"]),
				value: z.string(),
				instructions: z.string().nullable(),
			}),
		),
		instructions: z.array(z.string()),
	}),
});

export default jobSchema;
