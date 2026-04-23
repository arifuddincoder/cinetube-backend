import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await ReviewService.getAllReviews(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Reviews fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const query = req.query as IQueryParams;
	const result = await ReviewService.getMyReviews(user, query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "My reviews fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await ReviewService.getReviewById(id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review fetched successfully",
		data: result,
	});
});

const createReview = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;
	const result = await ReviewService.createReview(user, payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Review created successfully",
		data: result,
	});
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { id } = req.params;
	const payload = req.body;
	const result = await ReviewService.updateReview(user, id, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review updated successfully",
		data: result,
	});
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { id } = req.params;
	const result = await ReviewService.submitReview(user, id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review submitted successfully",
		data: result,
	});
});

const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await ReviewService.updateReviewStatus(id, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review status updated successfully",
		data: result,
	});
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { id } = req.params;
	const result = await ReviewService.deleteReview(user, id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review deleted successfully",
		data: result,
	});
});
const getReviewsByMovie = catchAsync(async (req: Request, res: Response) => {
	const { movieId } = req.params;
	const result = await ReviewService.getReviewsByMovie(movieId as string, req.query as any, req.user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Reviews fetched successfully",
		data: result,
	});
});

const getAllReviewsForAdmin = catchAsync(async (req, res) => {
	const result = await ReviewService.getAllReviewsForAdmin(req.query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Reviews retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getMyReviewForMovie = catchAsync(async (req, res) => {
	const user = req.user;
	const { movieId } = req.params;

	const result = await ReviewService.getMyReviewForMovie(user, movieId);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "My review retrieved successfully",
		data: result,
	});
});

const getPendingReviewsForMovie = catchAsync(async (req, res) => {
	const { movieId } = req.params;

	const result = await ReviewService.getPendingReviewsForMovie(movieId);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Pending reviews retrieved successfully",
		data: result,
	});
});

export const ReviewController = {
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
