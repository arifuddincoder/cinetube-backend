import status from "http-status";
import { ReviewStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateReviewPayload, IUpdateReviewPayload, IUpdateReviewStatusPayload } from "./review.interface";

const getAllReviews = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.review, query, {
		searchableFields: ["content"],
		filterableFields: ["status", "movieId", "userId", "hasSpoiler"],
	})
		.where({
			isDeleted: false,
		})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute();

	return result;
};

const getMyReviews = async (user: IRequestUser, query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.review, query, {
		searchableFields: ["content"],
		filterableFields: ["status", "movieId"],
	})
		.where({
			userId: user.userId,
			isDeleted: false,
		})
		.include({
			movie: {
				select: {
					id: true,
					title: true,
					posterImage: true,
					releaseYear: true,
				},
			},
			tags: {
				include: { tag: true },
			},
			likes: true,
		})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute();

	return result;
};

const getReviewById = async (id: string) => {
	const review = await prisma.review.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
			movie: {
				select: {
					id: true,
					title: true,
					posterImage: true,
					releaseYear: true,
				},
			},
			tags: {
				include: { tag: true },
			},
			likes: true,
			comments: {
				where: {
					isDeleted: false,
					parentId: null,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					replies: {
						where: { isDeleted: false },
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!review) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	return review;
};

const createReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
	const { movieId, tagIds, ...reviewData } = payload;

	const isMovieExist = await prisma.movie.findUnique({
		where: { id: movieId, isDeleted: false },
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	// check if user already has a review for this movie
	const isReviewExist = await prisma.review.findFirst({
		where: {
			userId: user.userId,
			movieId,
			isDeleted: false,
		},
	});

	if (isReviewExist) {
		throw new AppError(status.CONFLICT, "You have already reviewed this movie");
	}

	const review = await prisma.$transaction(async (tx) => {
		const createdReview = await tx.review.create({
			data: {
				...reviewData,
				userId: user.userId,
				movieId,
				status: ReviewStatus.PENDING,
			},
		});

		if (tagIds && tagIds.length > 0) {
			await tx.reviewTag.createMany({
				data: tagIds.map((tagId) => ({
					reviewId: createdReview.id,
					tagId,
				})),
			});
		}

		return tx.review.findUnique({
			where: { id: createdReview.id },
			include: {
				tags: { include: { tag: true } },
				movie: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});
	});

	return review;
};

const updateReview = async (user: IRequestUser, id: string, payload: IUpdateReviewPayload) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	// only owner can update
	if (isReviewExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to update this review");
	}

	// only DRAFT or PENDING review can be updated
	if (isReviewExist.status !== ReviewStatus.DRAFT && isReviewExist.status !== ReviewStatus.PENDING) {
		throw new AppError(status.BAD_REQUEST, "Only draft or pending reviews can be updated");
	}

	const { tagIds, ...reviewData } = payload;

	const review = await prisma.$transaction(async (tx) => {
		const updatedReview = await tx.review.update({
			where: { id },
			data: reviewData,
		});

		if (tagIds) {
			await tx.reviewTag.deleteMany({ where: { reviewId: id } });
			if (tagIds.length > 0) {
				await tx.reviewTag.createMany({
					data: tagIds.map((tagId) => ({ reviewId: id, tagId })),
				});
			}
		}

		return tx.review.findUnique({
			where: { id: updatedReview.id },
			include: {
				tags: { include: { tag: true } },
				movie: {
					select: {
						id: true,
						title: true,
						posterImage: true,
					},
				},
			},
		});
	});

	return review;
};

const submitReview = async (user: IRequestUser, id: string) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	if (isReviewExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to submit this review");
	}

	if (isReviewExist.status !== ReviewStatus.DRAFT) {
		throw new AppError(status.BAD_REQUEST, "Only draft reviews can be submitted");
	}

	const review = await prisma.review.update({
		where: { id },
		data: { status: ReviewStatus.PENDING },
	});

	return review;
};

const updateReviewStatus = async (id: string, payload: IUpdateReviewStatusPayload) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	if (isReviewExist.status === ReviewStatus.DRAFT || isReviewExist.status === ReviewStatus.PENDING) {
		if (payload.status === ReviewStatus.UNPUBLISHED) {
			throw new AppError(status.BAD_REQUEST, "Cannot unpublish a draft or pending review");
		}
	}

	const review = await prisma.review.update({
		where: { id },
		data: {
			status: payload.status,
			unpublishReason: payload.status === ReviewStatus.PUBLISHED ? null : payload.unpublishReason,
		},
	});

	return review;
};

const deleteReview = async (user: IRequestUser, id: string) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	if (isReviewExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to delete this review");
	}

	if (isReviewExist.status !== ReviewStatus.DRAFT && isReviewExist.status !== ReviewStatus.PENDING) {
		throw new AppError(status.BAD_REQUEST, "Only draft or pending reviews can be deleted");
	}

	const review = await prisma.review.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return review;
};
const getReviewsByMovie = async (movieId: string, query: IQueryParams) => {
	return await new QueryBuilder(prisma.review, query, {
		filterableFields: ["status"],
	})
		.where({ movieId, isDeleted: false })
		.sort()
		.paginate()
		.execute();
};
export const ReviewService = {
	getAllReviews,
	getMyReviews,
	getReviewById,
	createReview,
	updateReview,
	submitReview,
	updateReviewStatus,
	deleteReview,
	getReviewsByMovie,
};
