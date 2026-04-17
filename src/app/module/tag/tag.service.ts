import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { ICreateTagPayload, IUpdateTagPayload } from "./tag.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getAllTags = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.tag, query, {
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

const getTagById = async (id: string) => {
	const tag = await prisma.tag.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!tag) {
		throw new AppError(status.NOT_FOUND, "Tag not found");
	}

	return tag;
};

const createTag = async (payload: ICreateTagPayload) => {
	const isTagExist = await prisma.tag.findUnique({
		where: {
			name: payload.name,
		},
	});

	if (isTagExist) {
		throw new AppError(status.CONFLICT, "Tag already exists");
	}

	const tag = await prisma.tag.create({
		data: {
			name: payload.name,
		},
	});

	return tag;
};

const updateTag = async (id: string, payload: IUpdateTagPayload) => {
	const isTagExist = await prisma.tag.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isTagExist) {
		throw new AppError(status.NOT_FOUND, "Tag not found");
	}

	const updated = await prisma.tag.update({
		where: { id },
		data: {
			name: payload.name,
		},
	});

	return updated;
};

const deleteTag = async (id: string) => {
	const isTagExist = await prisma.tag.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isTagExist) {
		throw new AppError(status.NOT_FOUND, "Tag not found");
	}

	const tags = await prisma.tag.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedTime: new Date(),
		},
	});

	return tags;
};

export const TagService = {
	getAllTags,
	getTagById,
	createTag,
	updateTag,
	deleteTag,
};
