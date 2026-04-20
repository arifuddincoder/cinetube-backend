import z from "zod";
import { PricingType, RentalDuration } from "../../../generated/prisma/enums";

const rentalDurationValues = Object.values(RentalDuration) as [string, ...string[]];

// FormData থেকে array handle করার helper
const stringOrArray = z.union([z.string(), z.array(z.string())]).transform((val) => (Array.isArray(val) ? val : [val]));

export const createMovieZodSchema = z.object({
	title: z
		.string("Title must be a string")
		.min(1, "Title is required")
		.max(200, "Title must be at most 200 characters"),
	synopsis: z.string("Synopsis must be a string").min(10, "Synopsis must be at least 10 characters"),
	releaseYear: z.coerce
		.number("Release year must be a number")
		.int("Release year must be an integer")
		.min(1888, "Release year must be at least 1888")
		.max(new Date().getFullYear() + 5, "Release year is too far in the future"),
	director: z
		.string("Director must be a string")
		.min(2, "Director name must be at least 2 characters")
		.max(100, "Director name must be at most 100 characters"),
	posterImage: z.string().optional(),
	trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
	streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
	pricingType: z
		.enum([PricingType.FREE, PricingType.PREMIUM], {
			error: "Pricing type must be FREE or PREMIUM",
		})
		.optional(),
	rentPrice: z.coerce.number("Rent price must be a number").min(0, "Rent price cannot be negative").optional(),
	rentDuration: z.enum(rentalDurationValues).optional(),
	buyPrice: z.coerce.number("Buy price must be a number").min(0, "Buy price cannot be negative").optional(),
	genreIds: stringOrArray.optional(),
	platformIds: stringOrArray.optional(),
	castMemberIds: stringOrArray.optional(),
	isFeatured: z.coerce.boolean().optional(),
});

export const updateMovieZodSchema = z.object({
	title: z
		.string("Title must be a string")
		.min(1, "Title is required")
		.max(200, "Title must be at most 200 characters")
		.optional(),
	synopsis: z.string("Synopsis must be a string").min(10, "Synopsis must be at least 10 characters").optional(),
	releaseYear: z.coerce
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
	posterImage: z.string().optional(),
	trailerUrl: z.url("Trailer URL must be a valid URL").optional(),
	streamingUrl: z.url("Streaming URL must be a valid URL").optional(),
	pricingType: z
		.enum([PricingType.FREE, PricingType.PREMIUM], {
			error: "Pricing type must be FREE or PREMIUM",
		})
		.optional(),
	rentPrice: z.coerce.number("Rent price must be a number").min(0, "Rent price cannot be negative").optional(),
	rentDuration: z.enum(rentalDurationValues).optional(),
	buyPrice: z.coerce.number("Buy price must be a number").min(0, "Buy price cannot be negative").optional(),
	genreIds: stringOrArray.optional(),
	platformIds: stringOrArray.optional(),
	castMemberIds: stringOrArray.optional(),
	isFeatured: z
		.string()
		.transform((val) => val === "true" || val === "1")
		.optional(),
});
