import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TagService } from "./tag.service";

const getAllTags = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await TagService.getAllTags(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Tags fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getTagById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await TagService.getTagById(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Tag fetched successfully",
		data: result,
	});
});

const createTag = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await TagService.createTag(payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Tag created successfully",
		data: result,
	});
});

const updateTag = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await TagService.updateTag(id as string, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Tag updated successfully",
		data: result,
	});
});

const deleteTag = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await TagService.deleteTag(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Tag deleted successfully",
		data: result,
	});
});

export const TagController = {
	getAllTags,
	getTagById,
	createTag,
	updateTag,
	deleteTag,
};
