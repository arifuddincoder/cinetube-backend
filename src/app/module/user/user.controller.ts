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
		image: req.body.image,
		imagePublicId: req.body.imagePublicId,
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
const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user;
	const result = await UserService.changeUserStatus(payload, user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User status changed successfully",
		data: result,
	});
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user;
	const result = await UserService.changeUserRole(payload, user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User role changed successfully",
		data: result,
	});
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = req.user;
	await UserService.deleteUser(id as string, user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User deleted successfully",
	});
});

const hardDeleteUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = req.user;
	await UserService.hardDeleteUser(id as string, user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User permanently deleted successfully",
	});
});

export const UserController = {
	getAllUsers,
	getUserById,
	updateMyProfile,
	changeEmail,
	deleteUser,
	hardDeleteUser,
	changeUserStatus,
	changeUserRole,
};
