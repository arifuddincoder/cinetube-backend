import z from "zod";

export const createGenreZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters"),
});

export const updateGenreZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must be at most 100 characters")
		.optional(),
});
