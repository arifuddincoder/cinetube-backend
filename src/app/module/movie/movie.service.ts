import status from "http-status";
import { PricingType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateMoviePayload, IUpdateMoviePayload } from "./movie.interface";

const getAllMovies = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.movie, query, {
		searchableFields: ["title", "director", "synopsis"],
		filterableFields: ["pricingType", "releaseYear", "isDeleted"],
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

const getMovieById = async (id: string) => {
	const movie = await prisma.movie.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			genres: {
				include: {
					genre: true,
				},
			},
			platforms: {
				include: {
					platform: true,
				},
			},
			reviews: {
				where: {
					isDeleted: false,
					status: "PUBLISHED",
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					tags: {
						include: {
							tag: true,
						},
					},
					likes: true,
					comments: {
						where: {
							isDeleted: false,
							parentId: null,
						},
						include: {
							user: {
								select: {
									id: true,
									name: true,
									image: true,
								},
							},
							replies: {
								where: {
									isDeleted: false,
								},
								include: {
									user: {
										select: {
											id: true,
											name: true,
											image: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!movie) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	// calculate average rating
	const avgRating = await prisma.review.aggregate({
		where: {
			movieId: id,
			status: "PUBLISHED",
			isDeleted: false,
		},
		_avg: {
			rating: true,
		},
		_count: {
			rating: true,
		},
	});

	return {
		...movie,
		averageRating: avgRating._avg.rating ?? 0,
		totalReviews: avgRating._count.rating,
	};
};

const createMovie = async (payload: ICreateMoviePayload) => {
	const { genreIds, platformIds, rentPrice = 0, buyPrice = 0, rentDuration = 7, ...movieData } = payload;

	// auto set pricingType
	const pricingType = rentPrice === 0 && buyPrice === 0 ? PricingType.FREE : PricingType.PREMIUM;

	const movie = await prisma.$transaction(async (tx) => {
		const createdMovie = await tx.movie.create({
			data: {
				...movieData,
				rentPrice,
				buyPrice,
				rentDuration,
				pricingType,
			},
		});

		if (genreIds && genreIds.length > 0) {
			await tx.movieGenre.createMany({
				data: genreIds.map((genreId) => ({
					movieId: createdMovie.id,
					genreId,
				})),
			});
		}

		if (platformIds && platformIds.length > 0) {
			await tx.moviePlatform.createMany({
				data: platformIds.map((platformId) => ({
					movieId: createdMovie.id,
					platformId,
				})),
			});
		}

		return createdMovie;
	});

	return prisma.movie.findUnique({
		where: { id: movie.id },
		include: {
			genres: {
				include: { genre: true },
			},
			platforms: {
				include: { platform: true },
			},
		},
	});
};

const updateMovie = async (id: string, payload: IUpdateMoviePayload) => {
	const isMovieExist = await prisma.movie.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	const { genreIds, platformIds, rentPrice, buyPrice, rentDuration, ...movieData } = payload;

	// auto update pricingType
	const updatedRentPrice = rentPrice ?? isMovieExist.rentPrice;
	const updatedBuyPrice = buyPrice ?? isMovieExist.buyPrice;
	const updatedRentDuration = rentDuration ?? isMovieExist.rentDuration;
	const pricingType = updatedRentPrice === 0 && updatedBuyPrice === 0 ? PricingType.FREE : PricingType.PREMIUM;

	const movie = await prisma.$transaction(async (tx) => {
		const updatedMovie = await tx.movie.update({
			where: { id },
			data: {
				...movieData,
				rentPrice: updatedRentPrice,
				buyPrice: updatedBuyPrice,
				rentDuration: updatedRentDuration,
				pricingType,
			},
		});

		if (genreIds) {
			await tx.movieGenre.deleteMany({ where: { movieId: id } });
			if (genreIds.length > 0) {
				await tx.movieGenre.createMany({
					data: genreIds.map((genreId) => ({
						movieId: id,
						genreId,
					})),
				});
			}
		}

		if (platformIds) {
			await tx.moviePlatform.deleteMany({ where: { movieId: id } });
			if (platformIds.length > 0) {
				await tx.moviePlatform.createMany({
					data: platformIds.map((platformId) => ({
						movieId: id,
						platformId,
					})),
				});
			}
		}

		return updatedMovie;
	});

	return prisma.movie.findUnique({
		where: { id: movie.id },
		include: {
			genres: {
				include: { genre: true },
			},
			platforms: {
				include: { platform: true },
			},
		},
	});
};

const deleteMovie = async (id: string) => {
	const isMovieExist = await prisma.movie.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	const movie = await prisma.movie.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return movie;
};

const hardDeleteMovie = async (id: string) => {
	const isMovieExist = await prisma.movie.findUnique({
		where: { id },
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	if (!isMovieExist.isDeleted) {
		throw new AppError(status.BAD_REQUEST, "Movie must be soft deleted before permanent deletion");
	}

	const movie = await prisma.movie.delete({
		where: { id },
	});

	return movie;
};

export const MovieService = {
	getAllMovies,
	getMovieById,
	createMovie,
	updateMovie,
	deleteMovie,
	hardDeleteMovie,
};
