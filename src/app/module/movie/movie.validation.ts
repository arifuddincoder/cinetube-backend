import z from "zod";
import { PricingType } from "../../../generated/prisma/enums";

export const createMovieZodSchema = z.object({
	title: z
		.string("Title must be a string")
		.min(1, "Title is required")
		.max(200, "Title must be at most 200 characters"),
	synopsis: z.string("Synopsis must be a string").min(10, "Synopsis must be at least 10 characters"),
	releaseYear: z
		.number("Release year must be a number")
		.int("Release year must be an integer")
		.min(1888, "Release year must be at least 1888")
		.max(new Date().getFullYear() + 5, "Release year is too far in the future"),
	director: z
		.string("Director must be a string")
		.min(2, "Director name must be at least 2 characters")
		.max(100, "Director name must be at most 100 characters"),
	posterImage: z.url("Poster image must be a valid URL").optional(),
	trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
	streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
	pricingType: z
		.enum([PricingType.FREE, PricingType.PREMIUM], {
			error: "Pricing type must be FREE or PREMIUM",
		})
		.optional(),
	rentPrice: z.number("Rent price must be a number").min(0, "Rent price cannot be negative").optional(),
	rentDuration: z
		.number("Rent duration must be a number")
		.int("Rent duration must be an integer")
		.min(1, "Rent duration must be at least 1 day")
		.optional(),
	buyPrice: z.number("Buy price must be a number").min(0, "Buy price cannot be negative").optional(),
	genreIds: z.array(z.string()).optional(),
	platformIds: z.array(z.string()).optional(),
	castMemberIds: z.array(z.string()).optional(),
});

export const updateMovieZodSchema = z.object({
	title: z
		.string("Title must be a string")
		.min(1, "Title is required")
		.max(200, "Title must be at most 200 characters")
		.optional(),
	synopsis: z.string("Synopsis must be a string").min(10, "Synopsis must be at least 10 characters").optional(),
	releaseYear: z
		.number("Release year must be a number")
		.int("Release year must be an integer")
		.min(1888, "Release year must be at least 1888")
		.max(new Date().getFullYear() + 5, "Release year is too far in the future")
		.optional(),
	director: z
		.string("Director must be a string")
		.min(2, "Director name must be at least 2 characters")
		.max(100, "Director name must be at most 100 characters")
		.optional(),
	posterImage: z.url("Poster image must be a valid URL").optional(),
	trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
	streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
	pricingType: z
		.enum([PricingType.FREE, PricingType.PREMIUM], {
			error: "Pricing type must be FREE or PREMIUM",
		})
		.optional(),
	rentPrice: z.number("Rent price must be a number").min(0, "Rent price cannot be negative").optional(),
	rentDuration: z
		.number("Rent duration must be a number")
		.int("Rent duration must be an integer")
		.min(1, "Rent duration must be at least 1 day")
		.optional(),
	buyPrice: z.number("Buy price must be a number").min(0, "Buy price cannot be negative").optional(),
	genreIds: z.array(z.string()).optional(),
	platformIds: z.array(z.string()).optional(),
	castMemberIds: z.array(z.string()).optional(),
});
