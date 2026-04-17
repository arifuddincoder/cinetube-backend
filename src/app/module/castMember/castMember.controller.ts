import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CastMemberService } from "./castMember.service";

const getAllCastMembers = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await CastMemberService.getAllCastMembers(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Cast members fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getCastMemberById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await CastMemberService.getCastMemberById(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Cast member fetched successfully",
		data: result,
	});
});

const createCastMember = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await CastMemberService.createCastMember(payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Cast member created successfully",
		data: result,
	});
});

const updateCastMember = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await CastMemberService.updateCastMember(id as string, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Cast member updated successfully",
		data: result,
	});
});

const deleteCastMember = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await CastMemberService.deleteCastMember(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Cast member deleted successfully",
		data: result,
	});
});

export const CastMemberController = {
	getAllCastMembers,
	getCastMemberById,
	createCastMember,
	updateCastMember,
	deleteCastMember,
};
