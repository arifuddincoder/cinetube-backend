import { ReviewStatus } from "../../../generated/prisma/enums";

export interface ICreateReviewPayload {
	movieId: string;
	rating: number;
	content: string;
	hasSpoiler?: boolean;
	tagIds?: string[];
}

export interface IUpdateReviewPayload {
	rating?: number;
	content?: string;
	hasSpoiler?: boolean;
	tagIds?: string[];
}

export interface IUpdateReviewStatusPayload {
	status: ReviewStatus;
	unpublishReason?: string;
}
