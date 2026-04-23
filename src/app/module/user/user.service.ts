import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
	IUpdateUserPayload,
	IChangeEmailPayload,
	IChangeUserRolePayload,
	IChangeUserStatusPayload,
} from "./user.interface";
import { auth } from "../../lib/auth";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const getAllUsers = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.user, query, {
		searchableFields: ["name", "email"],
		filterableFields: ["status", "role"],
	})
		.where({
			isDeleted: false,
		})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute();

	return result;
};

const getUserById = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			role: true,
			status: true,
			emailVerified: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	return user;
};

const updateMyProfile = async (user: IRequestUser, payload: IUpdateUserPayload) => {
	const isUserExist = await prisma.user.findUnique({
		where: { id: user.userId, isDeleted: false },
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (payload.image && isUserExist.image && payload.image !== isUserExist.image) {
		await deleteFileFromCloudinary(isUserExist.imagePublicId || isUserExist.image);
	}

	const updated = await prisma.user.update({
		where: { id: user.userId },
		data: {
			name: payload.name,
			image: payload.image,
			imagePublicId: payload.imagePublicId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			role: true,
			status: true,
			emailVerified: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updated;
};

const changeEmail = async (user: IRequestUser, payload: IChangeEmailPayload) => {
	const isUserExist = await prisma.user.findUnique({
		where: {
			id: user.userId,
			isDeleted: false,
		},
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	const isEmailTaken = await prisma.user.findUnique({
		where: { email: payload.newEmail },
	});

	if (isEmailTaken) {
		throw new AppError(status.CONFLICT, "Email already taken");
	}

	await prisma.user.update({
		where: { id: user.userId },
		data: {
			email: payload.newEmail,
			emailVerified: false,
			lastOtpSentAt: new Date(),
		},
	});

	await auth.api.sendVerificationOTP({
		body: {
			email: payload.newEmail,
			type: "email-verification",
		},
	});
};

const changeUserStatus = async (payload: IChangeUserStatusPayload, user: IRequestUser) => {
	const { userId, status: userStatus } = payload;
	const { userId: adminUserId } = user;
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
	if (isUserExist.id === adminUserId) {
		throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
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

const changeUserRole = async (payload: IChangeUserRolePayload, user: IRequestUser) => {
	const { userId, role: userRole } = payload;
	const { userId: adminUserId } = user;
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
	if (isUserExist.id === adminUserId) {
		throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
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

const deleteUser = async (id: string, adminUser: IRequestUser) => {
	const { userId: adminUserId } = adminUser;
	const user = await prisma.user.findUnique({
		where: { id, isDeleted: false },
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (user.role === Role.SUPER_ADMIN) {
		throw new AppError(status.FORBIDDEN, "Cannot delete super admin");
	}

	if (user.id === adminUserId) {
		throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
	}

	await prisma.user.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
			status: UserStatus.DELETED,
		},
	});
};

const hardDeleteUser = async (id: string, adminUser: IRequestUser) => {
	const { userId: adminUserId } = adminUser;

	const user = await prisma.user.findUnique({
		where: { id },
	});

	if (!user) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	if (user.role === Role.SUPER_ADMIN) {
		throw new AppError(status.FORBIDDEN, "Cannot delete super admin");
	}

	if (user.id === adminUserId) {
		throw new AppError(status.BAD_REQUEST, "You cannot permanently delete yourself");
	}

	if (user.image) {
		await deleteFileFromCloudinary(user.image);
	}

	await prisma.user.delete({
		where: { id },
	});
};

export const UserService = {
	getAllUsers,
	getUserById,
	updateMyProfile,
	changeEmail,
	deleteUser,
	hardDeleteUser,
	changeUserStatus,
	changeUserRole,
};
