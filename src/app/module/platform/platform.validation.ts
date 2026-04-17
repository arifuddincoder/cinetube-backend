import z from "zod";

export const createPlatformZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters"),
	logo: z.url("Logo must be a valid URL").optional(),
	website: z.url("Website must be a valid URL").optional(),
});

export const updatePlatformZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters")
		.optional(),
	logo: z.url("Logo must be a valid URL").optional(),
	website: z.url("Website must be a valid URL").optional(),
});
