import z from "zod";
import { PlanType, PurchaseType, RentalDuration } from "../../../generated/prisma/enums";

const rentalDurationValues = Object.values(RentalDuration) as [string, ...string[]];

export const createSubscriptionZodSchema = z.object({
	planType: z.enum([PlanType.MONTHLY, PlanType.YEARLY], {
		error: "Plan type must be MONTHLY or YEARLY",
	}),
});

export const createRentOrBuyZodSchema = z.object({
	movieId: z.string().min(1, "Movie ID is required"),
	purchaseType: z.enum([PurchaseType.RENT, PurchaseType.BUY], {
		error: "Purchase type must be RENT or BUY",
	}),
	rentalDuration: z.enum(rentalDurationValues).optional(),
});
