import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CommentService } from "./comment.service";

const getCommentsByReview = catchAsync(async (req: Request, res: Response) => {
	const { reviewId } = req.params;
	const query = req.query as IQueryParams;
	const result = await CommentService.getCommentsByReview(reviewId as string, query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Comments fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const createComment = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;
	const result = await CommentService.createComment(user, payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Comment created successfully",
		data: result,
	});
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { id } = req.params;
	const payload = req.body;
	const result = await CommentService.updateComment(user, id, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Comment updated successfully",
		data: result,
	});
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { id } = req.params;
	const result = await CommentService.deleteComment(user, id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Comment deleted successfully",
		data: result,
	});
});

const getAllComments = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await CommentService.getAllComments(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Comments fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

export const CommentController = {
	getAllComments,
	getCommentsByReview,
	createComment,
	updateComment,
	deleteComment,
};
