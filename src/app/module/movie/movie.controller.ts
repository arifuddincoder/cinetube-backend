import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MovieService } from "./movie.service";

const getAllMovies = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await MovieService.getAllMovies(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movies fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getMovieById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await MovieService.getMovieById(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie fetched successfully",
		data: result,
	});
});

const createMovie = catchAsync(async (req: Request, res: Response) => {
	const payload = {
		...req.body,
		posterImage: req.body.posterImage,
	};

	const result = await MovieService.createMovie(payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Movie created successfully",
		data: result,
	});
});

const updateMovie = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const payload = {
		...req.body,
		posterImage: req.body.posterImage,
	};

	const result = await MovieService.updateMovie(id as string, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie updated successfully",
		data: result,
	});
});

const deleteMovie = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await MovieService.deleteMovie(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie deleted successfully",
		data: result,
	});
});

const hardDeleteMovie = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await MovieService.hardDeleteMovie(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie permanently deleted successfully",
		data: result,
	});
});
const getTopRatedMovies = catchAsync(async (req: Request, res: Response) => {
	const limit = Number(req.query.limit) || 5;
	const result = await MovieService.getTopRatedMovies(limit);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Top rated movies fetched successfully",
		data: result,
	});
});

const getMovieFilters = catchAsync(async (req: Request, res: Response) => {
	const result = await MovieService.getMovieFilters();

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie filters fetched successfully",
		data: result,
	});
});

export const MovieController = {
	getAllMovies,
	getMovieById,
	createMovie,
	updateMovie,
	deleteMovie,
	hardDeleteMovie,
	getTopRatedMovies,
	getMovieFilters,
};
