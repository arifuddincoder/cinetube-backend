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
			parentId: null, // only top level comments
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

	// if reply, check parent comment exists
	if (parentId) {
		const isParentExist = await prisma.comment.findUnique({
			where: { id: parentId, isDeleted: false },
		});

		if (!isParentExist) {
			throw new AppError(status.NOT_FOUND, "Parent comment not found");
		}

		// only one level of reply allowed
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

	// only owner can update
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

	// admin can delete any comment, user can only delete own
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

export const CommentService = {
	getCommentsByReview,
	createComment,
	updateComment,
	deleteComment,
};
