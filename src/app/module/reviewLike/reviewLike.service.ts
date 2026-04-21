import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const toggleLike = async (user: IRequestUser, reviewId: string) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id: reviewId, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	if (isReviewExist.userId === user.userId) {
		throw new AppError(status.BAD_REQUEST, "You cannot like your own review");
	}

	const isLiked = await prisma.reviewLike.findUnique({
		where: {
			userId_reviewId: {
				userId: user.userId,
				reviewId,
			},
		},
	});

	if (isLiked) {
		await prisma.reviewLike.delete({
			where: {
				userId_reviewId: {
					userId: user.userId,
					reviewId,
				},
			},
		});

		return { liked: false };
	}

	await prisma.reviewLike.create({
		data: {
			userId: user.userId,
			reviewId,
		},
	});

	return { liked: true };
};

const getReviewLikes = async (reviewId: string) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id: reviewId, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	const likes = await prisma.reviewLike.count({
		where: { reviewId },
	});

	return { reviewId, totalLikes: likes };
};

export const ReviewLikeService = {
	toggleLike,
	getReviewLikes,
};
