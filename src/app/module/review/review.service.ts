import status from "http-status";
import { ReviewStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateReviewPayload, IUpdateReviewPayload, IUpdateReviewStatusPayload } from "./review.interface";
import { Prisma } from "../../../generated/prisma/client";

const reviewInclude = {
	user: {
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
	},
	tags: {
		include: {
			tag: true,
		},
	},
	_count: {
		select: {
			comments: true,
		},
	},
	likes: {
		select: {
			userId: true,
		},
	},
} satisfies Prisma.ReviewInclude;

const getAllReviews = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.review, query, {
		searchableFields: ["content"],
		filterableFields: ["status", "movieId", "userId", "hasSpoiler"],
	})
		.where({ isDeleted: false })
		.include({
			user: { select: { id: true, name: true, email: true } },
			movie: { select: { id: true, title: true } },
			_count: { select: { likes: true, comments: { where: { isDeleted: false } } } },
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

	if (isReviewExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to update this review");
	}

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

const updateMovieStats = async (movieId: string) => {
	const stats = await prisma.review.aggregate({
		where: { movieId, status: ReviewStatus.PUBLISHED, isDeleted: false },
		_avg: { rating: true },
		_count: { rating: true },
	});

	await prisma.movie.update({
		where: { id: movieId },
		data: {
			averageRating: stats._avg.rating ?? 0,
			totalReviews: stats._count.rating,
		},
	});
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

	await updateMovieStats(isReviewExist.movieId);

	return review;
};

const deleteReview = async (user: IRequestUser, id: string) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
	const isOwner = isReviewExist.userId === user.userId;

	if (!isAdmin && !isOwner) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to delete this review");
	}

	if (
		!isAdmin &&
		isReviewExist.status !== ReviewStatus.DRAFT &&
		isReviewExist.status !== ReviewStatus.PENDING &&
		isReviewExist.status !== ReviewStatus.UNPUBLISHED
	) {
		throw new AppError(status.BAD_REQUEST, "You can delete only draft, pending, or unpublished reviews");
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
const getReviewsByMovie = async (movieId: string, query: IQueryParams, currentUser?: IRequestUser) => {
	const result = await new QueryBuilder(prisma.review, query, {})
		.where({ movieId, isDeleted: false, status: ReviewStatus.PUBLISHED })
		.sort()
		.paginate()
		.include({
			user: { select: { id: true, name: true, image: true } },
			tags: { include: { tag: true } },
			likes: { select: { userId: true } },
			_count: { select: { comments: { where: { isDeleted: false } } } },
		})
		.execute();

	const data = (result.data as any[]).map((review) => ({
		...review,
		totalLikes: review.likes?.length ?? 0,
		isLikedByCurrentUser: currentUser
			? (review.likes ?? []).some((l: { userId: string }) => l.userId === currentUser.userId)
			: false,
	}));

	return { ...result, data };
};

const getAllReviewsForAdmin = async (query: Record<string, any>) => {
	const page = Number(query.page) || 1;
	const limit = Number(query.limit) || 10;
	const skip = (page - 1) * limit;
	const searchTerm = query.searchTerm || query.search || "";

	const where: Prisma.ReviewWhereInput = {
		isDeleted: false,
		...(searchTerm
			? {
					OR: [
						{ content: { contains: searchTerm, mode: "insensitive" } },
						{ user: { name: { contains: searchTerm, mode: "insensitive" } } },
						{ user: { email: { contains: searchTerm, mode: "insensitive" } } },
						{ movie: { title: { contains: searchTerm, mode: "insensitive" } } },
					],
				}
			: {}),
	};

	const [data, total] = await Promise.all([
		prisma.review.findMany({
			where,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				reviewTags: {
					include: {
						tag: true,
					},
				},
				movie: {
					select: {
						id: true,
						title: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.review.count({ where }),
	]);

	return {
		data,
		meta: {
			page,
			limit,
			total,
			totalPage: Math.ceil(total / limit),
		},
	};
};

const getMyReviewForMovie = async (user: IRequestUser, movieId: string) => {
	const review = await prisma.review.findFirst({
		where: {
			movieId,
			userId: user.userId,
			isDeleted: false,
		},
		include: reviewInclude,
		orderBy: {
			createdAt: "desc",
		},
	});

	return review;
};

const getPendingReviewsForMovie = async (movieId: string) => {
	const reviews = await prisma.review.findMany({
		where: {
			movieId,
			status: ReviewStatus.PENDING,
			isDeleted: false,
		},
		include: reviewInclude,
		orderBy: {
			createdAt: "desc",
		},
	});

	return reviews;
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

	getAllReviewsForAdmin,
	getMyReviewForMovie,
	getPendingReviewsForMovie,
};
