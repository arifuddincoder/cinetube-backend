import z from "zod";
import { ReviewStatus } from "../../../generated/prisma/enums";

export const createReviewZodSchema = z.object({
	movieId: z.string("Movie ID must be a string").min(1, "Movie ID is required"),
	rating: z
		.number("Rating must be a number")
		.int("Rating must be an integer")
		.min(1, "Rating must be at least 1")
		.max(10, "Rating must be at most 10"),
	content: z.string("Content must be a string").min(10, "Content must be at least 10 characters"),
	hasSpoiler: z.boolean().optional(),
	tagIds: z.array(z.string()).optional(),
});

export const updateReviewZodSchema = z.object({
	rating: z
		.number("Rating must be a number")
		.int("Rating must be an integer")
		.min(1, "Rating must be at least 1")
		.max(10, "Rating must be at most 10")
		.optional(),
	content: z.string("Content must be a string").min(10, "Content must be at least 10 characters").optional(),
	hasSpoiler: z.boolean().optional(),
	tagIds: z.array(z.string()).optional(),
});

export const updateReviewStatusZodSchema = z.object({
	status: z.enum([ReviewStatus.PUBLISHED, ReviewStatus.UNPUBLISHED], {
		error: "Status must be PUBLISHED or UNPUBLISHED",
	}),
	unpublishReason: z.string().optional(),
});

export const submitReviewZodSchema = z.object({
	reviewId: z.string("Review ID must be a string").min(1, "Review ID is required"),
});
