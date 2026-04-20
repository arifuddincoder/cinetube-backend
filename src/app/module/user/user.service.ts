import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IUpdateUserPayload, IChangeEmailPayload } from "./user.interface";
import { auth } from "../../lib/auth";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

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

	// পুরনো image delete করো
	if (payload.image && isUserExist.image) {
		await deleteFileFromCloudinary(isUserExist.image);
	}

	const updated = await prisma.user.update({
		where: { id: user.userId },
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

export const UserService = {
	getAllUsers,
	getUserById,
	updateMyProfile,
	changeEmail,
};
