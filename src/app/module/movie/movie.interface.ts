import { PricingType, RentalDuration } from "../../../generated/prisma/enums";

export interface ICreateMoviePayload {
	title: string;
	synopsis: string;
	releaseYear: number;
	director: string;
	posterImage?: string;
	posterPublicId?: string;
	trailerUrl?: string;
	streamingUrl?: string;
	pricingType?: PricingType;
	rentPrice?: number;
	rentDuration?: RentalDuration;
	buyPrice?: number;
	genreIds?: string[];
	platformIds?: string[];
	castMemberIds?: string[];
	isFeatured?: boolean;
}

export interface IUpdateMoviePayload {
	title?: string;
	synopsis?: string;
	releaseYear?: number;
	director?: string;
	posterImage?: string;
	posterPublicId?: string;
	trailerUrl?: string;
	streamingUrl?: string;
	pricingType?: PricingType;
	rentPrice?: number;
	rentDuration?: RentalDuration;
	buyPrice?: number;
	genreIds?: string[];
	platformIds?: string[];
	castMemberIds?: string[];
	isFeatured?: boolean;
}
