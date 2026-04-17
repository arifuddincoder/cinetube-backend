import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateGenrePayload, IUpdateGenrePayload } from "./genre.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const getAllGenres = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.genre, query, {
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

const getGenreById = async (id: string) => {
	const genre = await prisma.genre.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!genre) {
		throw new AppError(status.NOT_FOUND, "Genre not found");
	}

	return genre;
};

const createGenre = async (payload: ICreateGenrePayload) => {
	const isGenreExist = await prisma.genre.findUnique({
		where: {
			name: payload.name,
		},
	});

	if (isGenreExist) {
		throw new AppError(status.CONFLICT, "Genre already exists");
	}

	const genre = await prisma.genre.create({
		data: {
			name: payload.name,
		},
	});

	return genre;
};

const updateGenre = async (id: string, payload: IUpdateGenrePayload) => {
	const isGenreExist = await prisma.genre.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isGenreExist) {
		throw new AppError(status.NOT_FOUND, "Genre not found");
	}

	const updated = await prisma.genre.update({
		where: { id },
		data: {
			name: payload.name,
		},
	});

	return updated;
};

const deleteGenre = async (id: string) => {
	const isGenreExist = await prisma.genre.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!isGenreExist) {
		throw new AppError(status.NOT_FOUND, "Genre not found");
	}

	const genre = await prisma.genre.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedTime: new Date(),
		},
	});
	return genre;
};

const hardDeleteGenre = async (id: string) => {
	const isGenreExist = await prisma.genre.findUnique({
		where: { id },
	});

	if (!isGenreExist) {
		throw new AppError(status.NOT_FOUND, "Genre not found");
	}

	if (!isGenreExist.isDeleted) {
		throw new AppError(status.BAD_REQUEST, "Genre must be soft deleted before permanent deletion");
	}

	const genre = await prisma.genre.delete({
		where: { id },
	});

	return genre;
};

export const GenreService = {
	getAllGenres,
	getGenreById,
	createGenre,
	updateGenre,
	deleteGenre,
	hardDeleteGenre,
};
