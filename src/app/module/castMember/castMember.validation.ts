import z from "zod";

export const createCastMemberZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters"),
});

export const updateCastMemberZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters")
		.optional(),
});
