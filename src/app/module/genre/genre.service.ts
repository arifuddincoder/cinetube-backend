import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateGenrePayload, IUpdateGenrePayload } from "./genre.interface";

const getAllGenres = async () => {
	const genres = await prisma.genre.findMany({
		where: {
			isDeleted: false,
		},
		orderBy: {
			name: "asc",
		},
	});

	return genres;
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

	// soft delete
	await prisma.genre.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedTime: new Date(),
		},
	});
};

export const GenreService = {
	getAllGenres,
	getGenreById,
	createGenre,
	updateGenre,
	deleteGenre,
};
