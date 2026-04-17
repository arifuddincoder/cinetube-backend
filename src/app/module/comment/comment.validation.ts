import z from "zod";

export const createCommentZodSchema = z.object({
	reviewId: z.string("Review ID must be a string").min(1, "Review ID is required"),
	content: z
		.string("Content must be a string")
		.min(1, "Content is required")
		.max(500, "Content must be at most 500 characters"),
	parentId: z.string().optional(),
});

export const updateCommentZodSchema = z.object({
	content: z
		.string("Content must be a string")
		.min(1, "Content is required")
		.max(500, "Content must be at most 500 characters"),
});
