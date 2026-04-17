import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { WatchlistService } from "./watchlist.service";

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const query = req.query as IQueryParams;
	const result = await WatchlistService.getMyWatchlist(user, query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Watchlist fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { movieId } = req.params;
	const result = await WatchlistService.addToWatchlist(user, movieId as string);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Movie added to watchlist successfully",
		data: result,
	});
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { movieId } = req.params;
	const result = await WatchlistService.removeFromWatchlist(user, movieId);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie removed from watchlist successfully",
		data: result,
	});
});

const clearWatchlist = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	await WatchlistService.clearWatchlist(user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Watchlist cleared successfully",
	});
});

export const WatchlistController = {
	getMyWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	clearWatchlist,
};
