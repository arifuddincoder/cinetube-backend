import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import {
	IChangeUserRolePayload,
	IChangeUserStatusPayload,
	ICreateAdminPayload,
	IUpdateAdminPayload,
} from "./admin.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getAllAdmins = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.user, query, {
		searchableFields: ["name", "email"],
		filterableFields: ["role", "status"],
	})
		.where({
			role: {
				in: [Role.ADMIN, Role.SUPER_ADMIN],
			},
			isDeleted: false,
		})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute();

	return result;
};

const getAdminById = async (id: string) => {
	const admin = await prisma.user.findUnique({
		where: {
			id,
			role: {
				in: [Role.ADMIN, Role.SUPER_ADMIN],
			},
			isDeleted: false,
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			role: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!admin) {
		throw new AppError(status.NOT_FOUND, "Admin not found");
	}

	return admin;
};

const createAdmin = async (payload: ICreateAdminPayload) => {
	const { name, email, password } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist) {
		throw new AppError(status.CONFLICT, "User already exists with this email");
	}

	const data = await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
			role: Role.ADMIN,
		},
	});

	if (!data.user) {
		throw new AppError(status.BAD_REQUEST, "Failed to create admin");
	}

	await prisma.user.update({
		where: { id: data.user.id },
		data: {
			emailVerified: true,
			role: Role.ADMIN,
			needPasswordChange: true,
		},
	});

	const admin = await prisma.user.findUnique({
		where: { id: data.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
			needPasswordChange: true,
			createdAt: true,
		},
	});

	return admin;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
	const isAdminExist = await prisma.user.findUnique({
		where: {
			id,
			role: {
				in: [Role.ADMIN, Role.SUPER_ADMIN],
			},
			isDeleted: false,
		},
	});

	if (!isAdminExist) {
		throw new AppError(status.NOT_FOUND, "Admin not found");
	}

	const updated = await prisma.user.update({
		where: { id },
		data: {
			name: payload.name,
			image: payload.image,
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			role: true,
			status: true,
			updatedAt: true,
		},
	});

	return updated;
};

const deleteAdmin = async (id: string) => {
	const isAdminExist = await prisma.user.findUnique({
		where: {
			id,
			role: Role.ADMIN,
			isDeleted: false,
		},
	});

	if (!isAdminExist) {
		throw new AppError(status.NOT_FOUND, "Admin not found");
	}

	const admin = await prisma.user.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
			status: UserStatus.DELETED,
		},
	});
	return admin;
};

const changeUserStatus = async (payload: IChangeUserStatusPayload) => {
	const { userId, status: userStatus } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			id: userId,
			isDeleted: false,
		},
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (isUserExist.role === Role.SUPER_ADMIN) {
		throw new AppError(status.FORBIDDEN, "Cannot change super admin status");
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { status: userStatus as UserStatus },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
		},
	});

	return updated;
};

const changeUserRole = async (payload: IChangeUserRolePayload) => {
	const { userId, role: userRole } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			id: userId,
			isDeleted: false,
		},
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (isUserExist.role === Role.SUPER_ADMIN) {
		throw new AppError(status.FORBIDDEN, "Cannot change super admin role");
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { role: userRole as Role },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			status: true,
		},
	});

	return updated;
};

const hardDeleteAdmin = async (id: string) => {
	const isAdminExist = await prisma.user.findUnique({
		where: {
			id,
			role: Role.ADMIN,
		},
	});

	if (!isAdminExist) {
		throw new AppError(status.NOT_FOUND, "Admin not found");
	}

	const admin = await prisma.user.delete({
		where: { id },
	});

	return admin;
};

export const AdminService = {
	getAllAdmins,
	getAdminById,
	createAdmin,
	updateAdmin,
	deleteAdmin,
	changeUserStatus,
	changeUserRole,
	hardDeleteAdmin,
};
