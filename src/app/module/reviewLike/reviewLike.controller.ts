import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewLikeService } from "./reviewLike.service";

const toggleLike = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { reviewId } = req.params;
	const result = await ReviewLikeService.toggleLike(user, reviewId as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: result.liked ? "Review liked successfully" : "Review unliked successfully",
		data: result,
	});
});

const getReviewLikes = catchAsync(async (req: Request, res: Response) => {
	const { reviewId } = req.params;
	const result = await ReviewLikeService.getReviewLikes(reviewId as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Review likes fetched successfully",
		data: result,
	});
});

export const ReviewLikeController = {
	toggleLike,
	getReviewLikes,
};
