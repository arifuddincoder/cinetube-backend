import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateCommentPayload, IUpdateCommentPayload } from "./comment.interface";

const getCommentsByReview = async (reviewId: string, query: IQueryParams) => {
	const isReviewExist = await prisma.review.findUnique({
		where: { id: reviewId, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	const result = await new QueryBuilder(prisma.comment, query, {
		searchableFields: ["content"],
		filterableFields: [],
	})
		.where({
			reviewId,
			isDeleted: false,
			parentId: null,
		})
		.include({
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
		})
		.sort()
		.paginate()
		.execute();

	return result;
};

const createComment = async (user: IRequestUser, payload: ICreateCommentPayload) => {
	const { reviewId, parentId, content } = payload;

	const isReviewExist = await prisma.review.findUnique({
		where: { id: reviewId, isDeleted: false },
	});

	if (!isReviewExist) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	if (parentId) {
		const isParentExist = await prisma.comment.findUnique({
			where: { id: parentId, isDeleted: false },
		});

		if (!isParentExist) {
			throw new AppError(status.NOT_FOUND, "Parent comment not found");
		}

		if (isParentExist.parentId) {
			throw new AppError(status.BAD_REQUEST, "Cannot reply to a reply");
		}
	}

	const comment = await prisma.comment.create({
		data: {
			userId: user.userId,
			reviewId,
			content,
			parentId: parentId || null,
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
	});

	return comment;
};

const updateComment = async (user: IRequestUser, id: string, payload: IUpdateCommentPayload) => {
	const isCommentExist = await prisma.comment.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isCommentExist) {
		throw new AppError(status.NOT_FOUND, "Comment not found");
	}

	if (isCommentExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to update this comment");
	}

	const comment = await prisma.comment.update({
		where: { id },
		data: { content: payload.content },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	});

	return comment;
};

const deleteComment = async (user: IRequestUser, id: string) => {
	const isCommentExist = await prisma.comment.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isCommentExist) {
		throw new AppError(status.NOT_FOUND, "Comment not found");
	}

	if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN && isCommentExist.userId !== user.userId) {
		throw new AppError(status.FORBIDDEN, "You are not allowed to delete this comment");
	}

	const comment = await prisma.comment.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return comment;
};

const getAllComments = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.comment, query, {
		searchableFields: ["content"],
		filterableFields: [],
	})
		.where({ isDeleted: false })
		.include({
			user: { select: { id: true, name: true, email: true } },
			review: {
				select: {
					id: true,
					movie: { select: { id: true, title: true } },
				},
			},
		})
		.search()
		.sort()
		.paginate()
		.execute();

	return result;
};

export const CommentService = {
	getAllComments,
	getCommentsByReview,
	createComment,
	updateComment,
	deleteComment,
};
