import { PricingType } from "../../../generated/prisma/enums";

export interface ICreateMoviePayload {
	title: string;
	synopsis: string;
	releaseYear: number;
	director: string;
	cast: string[];
	posterImage?: string;
	trailerUrl?: string;
	streamingUrl?: string;
	pricingType?: PricingType;
	rentPrice?: number;
	buyPrice?: number;
	genreIds?: string[];
	platformIds?: string[];
}

export interface IUpdateMoviePayload {
	title?: string;
	synopsis?: string;
	releaseYear?: number;
	director?: string;
	cast?: string[];
	posterImage?: string;
	trailerUrl?: string;
	streamingUrl?: string;
	pricingType?: PricingType;
	rentPrice?: number;
	buyPrice?: number;
	genreIds?: string[];
	platformIds?: string[];
}
