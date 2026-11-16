import z from "zod";

const userSchema = z.object({
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	location: z.string().optional(),
	urls: z.record(z.string(), z.url()).default({}),
});
export default userSchema;
