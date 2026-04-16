import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { GenreService } from "./genre.service";

const getAllGenres = catchAsync(async (req: Request, res: Response) => {
	const result = await GenreService.getAllGenres();

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Genres fetched successfully",
		data: result,
	});
});

const getGenreById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await GenreService.getGenreById(id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Genre fetched successfully",
		data: result,
	});
});

const createGenre = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await GenreService.createGenre(payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Genre created successfully",
		data: result,
	});
});

const updateGenre = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await GenreService.updateGenre(id, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Genre updated successfully",
		data: result,
	});
});

const deleteGenre = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	await GenreService.deleteGenre(id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Genre deleted successfully",
	});
});

export const GenreController = {
	getAllGenres,
	getGenreById,
	createGenre,
	updateGenre,
	deleteGenre,
};
