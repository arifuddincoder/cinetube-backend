import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreatePlatformPayload, IUpdatePlatformPayload } from "./platform.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllPlatforms = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.platform, query, {
		searchableFields: ["name"],
		filterableFields: ["isDeleted"],
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

const getPlatformById = async (id: string) => {
	const platform = await prisma.platform.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!platform) {
		throw new AppError(status.NOT_FOUND, "Platform not found");
	}

	return platform;
};

const createPlatform = async (payload: ICreatePlatformPayload) => {
	const isPlatformExist = await prisma.platform.findUnique({
		where: {
			name: payload.name,
		},
	});

	if (isPlatformExist) {
		throw new AppError(status.CONFLICT, "Platform already exists");
	}

	const platform = await prisma.platform.create({
		data: {
			name: payload.name,
			logo: payload.logo,
			website: payload.website,
		},
	});

	return platform;
};

const updatePlatform = async (id: string, payload: IUpdatePlatformPayload) => {
	const isPlatformExist = await prisma.platform.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isPlatformExist) {
		throw new AppError(status.NOT_FOUND, "Platform not found");
	}

	const updated = await prisma.platform.update({
		where: { id },
		data: {
			name: payload.name,
			logo: payload.logo,
			website: payload.website,
		},
	});

	return updated;
};

const deletePlatform = async (id: string) => {
	const isPlatformExist = await prisma.platform.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isPlatformExist) {
		throw new AppError(status.NOT_FOUND, "Platform not found");
	}

	const platform = await prisma.platform.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});
	return platform;
};

export const PlatformService = {
	getAllPlatforms,
	getPlatformById,
	createPlatform,
	updatePlatform,
	deletePlatform,
};
