import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getMyWatchlist = async (user: IRequestUser, query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.watchlist, query, {
		searchableFields: [],
		filterableFields: [],
	})
		.where({
			userId: user.userId,
		})
		.sort()
		.paginate()
		.execute();

	return result;
};

const addToWatchlist = async (user: IRequestUser, movieId: string) => {
	const isMovieExist = await prisma.movie.findUnique({
		where: {
			id: movieId,
			isDeleted: false,
		},
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	const isAlreadyInWatchlist = await prisma.watchlist.findUnique({
		where: {
			userId_movieId: {
				userId: user.userId,
				movieId,
			},
		},
	});

	if (isAlreadyInWatchlist) {
		throw new AppError(status.CONFLICT, "Movie already in watchlist");
	}

	const watchlist = await prisma.watchlist.create({
		data: {
			userId: user.userId,
			movieId,
		},
		include: {
			movie: {
				select: {
					id: true,
					title: true,
					posterImage: true,
					pricingType: true,
					releaseYear: true,
				},
			},
		},
	});

	return watchlist;
};

const removeFromWatchlist = async (user: IRequestUser, movieId: string) => {
	const isInWatchlist = await prisma.watchlist.findUnique({
		where: {
			userId_movieId: {
				userId: user.userId,
				movieId,
			},
		},
	});

	if (!isInWatchlist) {
		throw new AppError(status.NOT_FOUND, "Movie not found in watchlist");
	}

	const watchlist = await prisma.watchlist.delete({
		where: {
			userId_movieId: {
				userId: user.userId,
				movieId,
			},
		},
	});

	return watchlist;
};

const clearWatchlist = async (user: IRequestUser) => {
	await prisma.watchlist.deleteMany({
		where: {
			userId: user.userId,
		},
	});
};

export const WatchlistService = {
	getMyWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	clearWatchlist,
};
