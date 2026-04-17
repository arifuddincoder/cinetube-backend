import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PlatformService } from "./platform.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllPlatforms = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await PlatformService.getAllPlatforms(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Platforms fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getPlatformById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await PlatformService.getPlatformById(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Platform fetched successfully",
		data: result,
	});
});

const createPlatform = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await PlatformService.createPlatform(payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Platform created successfully",
		data: result,
	});
});

const updatePlatform = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await PlatformService.updatePlatform(id as string, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Platform updated successfully",
		data: result,
	});
});

const deletePlatform = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	await PlatformService.deletePlatform(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Platform deleted successfully",
	});
});

export const PlatformController = {
	getAllPlatforms,
	getPlatformById,
	createPlatform,
	updatePlatform,
	deletePlatform,
};
