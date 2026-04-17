import { PlanType, PurchaseType, RentalDuration } from "../../../generated/prisma/enums";

export interface ICreateSubscriptionPayload {
	planType: PlanType;
}

export interface ICreateRentOrBuyPayload {
	movieId: string;
	purchaseType: PurchaseType;
	rentalDuration?: RentalDuration;
}
