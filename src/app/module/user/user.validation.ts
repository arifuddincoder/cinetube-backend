import z from "zod";

export const updateUserZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters")
		.optional(),
});

export const changeEmailZodSchema = z.object({
	newEmail: z.email("New email must be a valid email address"),
});
