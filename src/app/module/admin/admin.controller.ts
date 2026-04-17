import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await AdminService.getAllAdmins(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Admins fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await AdminService.getAdminById(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Admin fetched successfully",
		data: result,
	});
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AdminService.createAdmin(payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Admin created successfully",
		data: result,
	});
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	const result = await AdminService.updateAdmin(id as string, payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Admin updated successfully",
		data: result,
	});
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await AdminService.deleteAdmin(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Admin deleted successfully",
		data: result,
	});
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AdminService.changeUserStatus(payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User status changed successfully",
		data: result,
	});
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AdminService.changeUserRole(payload);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User role changed successfully",
		data: result,
	});
});
const hardDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await AdminService.hardDeleteAdmin(id as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Admin permanently deleted successfully",
		data: result,
	});
});
export const AdminController = {
	getAllAdmins,
	getAdminById,
	createAdmin,
	updateAdmin,
	deleteAdmin,
	changeUserStatus,
	changeUserRole,
	hardDeleteAdmin,
};
