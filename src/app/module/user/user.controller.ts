import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await UserService.getAllUsers(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Users fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await UserService.getUserById(id);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User fetched successfully",
		data: result,
	});
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;

	const payload = {
		...req.body,
		image: req.file?.path,
	};

	const result = await UserService.updateMyProfile(user, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Profile updated successfully",
		data: result,
	});
});

const changeEmail = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;

	await UserService.changeEmail(user, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Verification email sent to new email address",
	});
});

export const UserController = {
	getAllUsers,
	getUserById,
	updateMyProfile,
	changeEmail,
};
