import status from "http-status";
import { PricingType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateMoviePayload, IUpdateMoviePayload } from "./movie.interface";

const getAllMovies = async (query: IQueryParams) => {
	const {
		genreId,
		platformId,
		minRating,
		search,
		searchTerm,
		sortBy,
		sortOrder,
		releaseYearFrom,
		releaseYearTo,
		...restQuery
	} = query as any;

	const searchValue = search ?? searchTerm;

	const directSortableFields = [
		"title",
		"releaseYear",
		"createdAt",
		"updatedAt",
		"pricingType",
		"averageRating",
		"totalReviews",
	];
	const safeSortBy = directSortableFields.includes(sortBy) ? sortBy : "createdAt";
	const safeSortOrder = sortOrder ?? "desc";

	const whereClause: any = { isDeleted: false };

	if (genreId) {
		whereClause.genres = { some: { genreId } };
	}

	if (platformId) {
		whereClause.platforms = { some: { platformId } };
	}

	if (releaseYearFrom || releaseYearTo) {
		whereClause.releaseYear = {};
		if (releaseYearFrom) whereClause.releaseYear.gte = parseInt(releaseYearFrom);
		if (releaseYearTo) whereClause.releaseYear.lte = parseInt(releaseYearTo);
	}

	if (searchValue) {
		whereClause.AND = [
			{
				OR: [
					{ title: { contains: searchValue, mode: "insensitive" } },
					{ director: { contains: searchValue, mode: "insensitive" } },
					{ synopsis: { contains: searchValue, mode: "insensitive" } },
					{
						genres: {
							some: {
								genre: { name: { contains: searchValue, mode: "insensitive" } },
							},
						},
					},
					{
						platforms: {
							some: {
								platform: { name: { contains: searchValue, mode: "insensitive" } },
							},
						},
					},
					{
						movieCasts: {
							some: {
								castMember: { name: { contains: searchValue, mode: "insensitive" } },
							},
						},
					},
				],
			},
		];
	}

	const result = await new QueryBuilder(
		prisma.movie,
		{ ...restQuery, sortBy: safeSortBy, sortOrder: safeSortOrder },
		{
			filterableFields: ["pricingType", "isFeatured"],
		},
	)
		.where(whereClause)
		.filter()
		.sort()
		.paginate()
		.execute();

	if (minRating) {
		const min = parseFloat(minRating);
		result.data = (result.data as any[]).filter((movie: any) => (movie.averageRating ?? 0) >= min);
	}

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
			movieCasts: {
				include: {
					castMember: true,
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
	const { genreIds, platformIds, castMemberIds, rentPrice = 0, buyPrice = 0, rentDuration, ...movieData } = payload;

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

		if (castMemberIds && castMemberIds.length > 0) {
			await tx.movieCast.createMany({
				data: castMemberIds.map((castMemberId) => ({
					movieId: createdMovie.id,
					castMemberId,
				})),
			});
		}

		return tx.movie.findUnique({
			where: { id: createdMovie.id },
			include: {
				genres: { include: { genre: true } },
				platforms: { include: { platform: true } },
				movieCasts: { include: { castMember: true } },
			},
		});
	});

	return movie;
};

const updateMovie = async (id: string, payload: IUpdateMoviePayload) => {
	const isMovieExist = await prisma.movie.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isMovieExist) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	const { genreIds, platformIds, castMemberIds, rentPrice, buyPrice, rentDuration, ...movieData } = payload;

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
					data: genreIds.map((genreId) => ({ movieId: id, genreId })),
				});
			}
		}

		if (platformIds) {
			await tx.moviePlatform.deleteMany({ where: { movieId: id } });
			if (platformIds.length > 0) {
				await tx.moviePlatform.createMany({
					data: platformIds.map((platformId) => ({ movieId: id, platformId })),
				});
			}
		}

		if (castMemberIds) {
			await tx.movieCast.deleteMany({ where: { movieId: id } });
			if (castMemberIds.length > 0) {
				await tx.movieCast.createMany({
					data: castMemberIds.map((castMemberId) => ({ movieId: id, castMemberId })),
				});
			}
		}

		return tx.movie.findUnique({
			where: { id: updatedMovie.id },
			include: {
				genres: { include: { genre: true } },
				platforms: { include: { platform: true } },
				movieCasts: { include: { castMember: true } },
			},
		});
	});

	return movie;
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

const getTopRatedMovies = async (limit = 3) => {
	const movies = await prisma.movie.findMany({
		where: { isDeleted: false },
		include: {
			genres: { include: { genre: true } },
			platforms: { include: { platform: true } },
			reviews: {
				where: { status: "PUBLISHED", isDeleted: false },
				select: { rating: true },
			},
		},
	});

	const moviesWithRating = movies.map((movie) => {
		const ratings = movie.reviews.map((r) => r.rating);
		const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
		return { ...movie, averageRating: avg, totalReviews: ratings.length };
	});

	return moviesWithRating.sort((a, b) => b.averageRating - a.averageRating).slice(0, limit);
};

// movie.service.ts এ যোগ করো
const getMovieFilters = async () => {
	const movies = await prisma.movie.findMany({
		where: { isDeleted: false },
		select: {
			releaseYear: true,
			genres: { include: { genre: true } },
			platforms: { include: { platform: true } },
		},
	});

	const genreMap = new Map();
	const platformMap = new Map();
	const yearSet = new Set<number>();

	movies.forEach((movie) => {
		yearSet.add(movie.releaseYear);
		movie.genres.forEach(({ genre }) => genreMap.set(genre.id, genre));
		movie.platforms.forEach(({ platform }) => platformMap.set(platform.id, platform));
	});

	return {
		genres: Array.from(genreMap.values()),
		platforms: Array.from(platformMap.values()),
		availableYears: Array.from(yearSet).sort((a, b) => b - a),
	};
};

export const MovieService = {
	getAllMovies,
	getMovieById,
	createMovie,
	updateMovie,
	deleteMovie,
	hardDeleteMovie,
	getTopRatedMovies,
	getMovieFilters,
};
