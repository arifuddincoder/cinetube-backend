import {
	PaymentStatus,
	PurchaseType,
	ReviewStatus,
	SubscriptionStatus,
	UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getStartOfDay = (date: Date) => {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
};

const getDateDaysAgo = (days: number) => {
	const date = getStartOfDay(new Date());
	date.setDate(date.getDate() - days);
	return date;
};

const formatMonthLabel = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		year: "numeric",
	}).format(date);
};

const buildMonthLabels = (months = 6) => {
	const labels = [] as string[];
	const now = new Date();
	for (let index = months - 1; index >= 0; index -= 1) {
		const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
		labels.push(formatMonthLabel(date));
	}
	return labels;
};

const buildReviewByDayLabels = (days = 7) => {
	const labels: { date: string; label: string }[] = [];
	const start = getDateDaysAgo(days - 1);
	for (let i = 0; i < days; i += 1) {
		const date = new Date(start);
		date.setDate(start.getDate() + i);
		labels.push({
			date: date.toISOString().slice(0, 10),
			label: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
		});
	}
	return labels;
};

const getDashboardStatsData = async (user: IRequestUser) => {
	const [
		totalMovies,
		featuredMoviesCount,
		moviePricingGroup,
		totalUsers,
		activeUsers,
		blockedUsers,
		deletedUsers,
		newUsersLast7Days,
		newUsersLast30Days,
		activeSubscribers,
		newSubscribersLast7Days,
		reviewStatusTotals,
		reviewRatingAggregate,
		completedPaymentTotals,
		rentRevenueAggregate,
		buyRevenueAggregate,
		subscriptionRevenueAggregate,
		rentCount,
		buyCount,
		recentPayments,
		genreStats,
		platformStats,
		topRatedTitles,
		mostReviewedTitles,
	] = await Promise.all([
		prisma.movie.count({ where: { isDeleted: false } }),
		prisma.movie.count({ where: { isDeleted: false, isFeatured: true } }),
		prisma.movie.groupBy({ where: { isDeleted: false }, by: ["pricingType"], _count: { id: true } }),
		prisma.user.count({ where: { isDeleted: false } }),
		prisma.user.count({ where: { isDeleted: false, status: UserStatus.ACTIVE } }),
		prisma.user.count({ where: { isDeleted: false, status: UserStatus.BLOCKED } }),
		prisma.user.count({ where: { isDeleted: true } }),
		prisma.user.count({ where: { isDeleted: false, createdAt: { gte: getDateDaysAgo(7) } } }),
		prisma.user.count({ where: { isDeleted: false, createdAt: { gte: getDateDaysAgo(30) } } }),
		prisma.user.count({ where: { isDeleted: false, subscriptionStatus: SubscriptionStatus.ACTIVE } }),
		prisma.user.count({
			where: {
				isDeleted: false,
				subscriptionStatus: SubscriptionStatus.ACTIVE,
				createdAt: { gte: getDateDaysAgo(7) },
			},
		}),
		prisma.review.groupBy({
			by: ["status"],
			where: { isDeleted: false },
			_count: { id: true },
		}),
		prisma.review.aggregate({
			where: { isDeleted: false, status: ReviewStatus.PUBLISHED },
			_avg: { rating: true },
			_count: { id: true },
		}),
		prisma.payment.aggregate({
			where: { status: PaymentStatus.COMPLETED },
			_sum: { amount: true },
		}),
		prisma.payment.aggregate({
			where: {
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.RENT,
			},
			_sum: { amount: true },
		}),
		prisma.payment.aggregate({
			where: {
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.BUY,
			},
			_sum: { amount: true },
		}),
		prisma.payment.aggregate({
			where: {
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.SUBSCRIPTION,
			},
			_sum: { amount: true },
		}),
		prisma.payment.count({
			where: {
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.RENT,
			},
		}),
		prisma.payment.count({
			where: {
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.BUY,
			},
		}),
		prisma.payment.findMany({
			where: {
				status: PaymentStatus.COMPLETED,
				createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) },
			},
			select: { amount: true, createdAt: true },
		}),
		prisma.genre.findMany({
			where: { isDeleted: false, movieGenres: { some: { movie: { isDeleted: false } } } },
			select: {
				name: true,
				movieGenres: {
					where: { movie: { isDeleted: false } },
					select: { movieId: true },
				},
			},
		}),
		prisma.platform.findMany({
			where: { isDeleted: false, movies: { some: { movie: { isDeleted: false } } } },
			select: {
				name: true,
				movies: {
					where: { movie: { isDeleted: false } },
					select: { movieId: true },
				},
			},
		}),
		prisma.movie.findMany({
			where: { isDeleted: false, totalReviews: { gt: 0 } },
			orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
			take: 5,
			select: { id: true, title: true, averageRating: true, totalReviews: true },
		}),
		prisma.movie.findMany({
			where: { isDeleted: false },
			orderBy: [{ totalReviews: "desc" }],
			take: 5,
			select: { id: true, title: true, totalReviews: true, averageRating: true },
		}),
	]);

	const pricingTypeCounts = moviePricingGroup.reduce(
		(prev, item) => ({ ...prev, [item.pricingType]: item._count.id }),
		{ FREE: 0, PREMIUM: 0 } as Record<string, number>,
	);

	const reviewStats = {
		pending: reviewStatusTotals.find((item) => item.status === ReviewStatus.PENDING)?._count.id ?? 0,
		published: reviewStatusTotals.find((item) => item.status === ReviewStatus.PUBLISHED)?._count.id ?? 0,
		draft: reviewStatusTotals.find((item) => item.status === ReviewStatus.DRAFT)?._count.id ?? 0,
		unpublished: reviewStatusTotals.find((item) => item.status === ReviewStatus.UNPUBLISHED)?._count.id ?? 0,
		totalPublishedReviews: reviewRatingAggregate._count.id,
		averageRatingOverall: Number((reviewRatingAggregate._avg.rating ?? 0).toFixed(2)),
	};

	const paymentTransactions = recentPayments.reduce<Record<string, number>>((prev, payment) => {
		const monthKey = formatMonthLabel(payment.createdAt);
		prev[monthKey] = (prev[monthKey] ?? 0) + payment.amount;
		return prev;
	}, {});

	const monthlyRevenue = buildMonthLabels(6).map((month) => ({
		month,
		revenue: paymentTransactions[month] ?? 0,
	}));

	const reviewLabels = buildReviewByDayLabels();
	const publishedReviewsSince = await prisma.review.findMany({
		where: {
			status: ReviewStatus.PUBLISHED,
			isDeleted: false,
			createdAt: { gte: getDateDaysAgo(6) },
		},
		select: { createdAt: true },
	});

	const reviewsByDay = reviewLabels.map(({ date, label }) => ({
		label,
		date,
		count: publishedReviewsSince.filter((review) => review.createdAt.toISOString().slice(0, 10) === date).length,
	}));

	return {
		summary: {
			totalMovies,
			featuredMoviesCount,
			pricingTypeCounts,
			totalUsers,
			activeUsers,
			blockedUsers,
			deletedUsers,
			activeSubscribers,
			totalRevenue: Number((completedPaymentTotals._sum.amount ?? 0).toFixed(2)),
			totalRentals: rentCount,
			totalPurchases: buyCount,
			totalSubscriptionRevenue: Number((subscriptionRevenueAggregate._sum.amount ?? 0).toFixed(2)),
		},
		reviewStats,
		userStats: {
			newUsersLast7Days,
			newUsersLast30Days,
			newSubscribersLast7Days,
		},
		paymentStats: {
			revenueByType: [
				{ type: PurchaseType.BUY, amount: buyRevenueAggregate._sum.amount ?? 0 },
				{ type: PurchaseType.RENT, amount: rentRevenueAggregate._sum.amount ?? 0 },
				{ type: PurchaseType.SUBSCRIPTION, amount: subscriptionRevenueAggregate._sum.amount ?? 0 },
			],
			monthlyRevenue,
		},
		trendStats: {
			reviewsByDay,
		},
		ratingReports: {
			topRatedTitles,
			mostReviewedTitles,
		},
		genreDistribution: genreStats.map((genre) => ({
			genre: genre.name,
			count: genre.movieGenres.length,
		})),
		platformDistribution: platformStats.map((platform) => ({
			platform: platform.name,
			count: platform.movies.length,
		})),
	};
};

const getUserStatsData = async (user: IRequestUser) => {
	const [
		userRecord,
		reviewStatusTotals,
		reviewRatingAggregate,
		paymentTotals,
		rentPaymentCount,
		buyPaymentCount,
		subscriptionPaymentCount,
		watchlistCount,
		recentReviews,
		recentPayments,
	] = await Promise.all([
		prisma.user.findUnique({
			where: { id: user.userId },
			select: {
				subscriptionStatus: true,
				stripeCustomerId: true,
				createdAt: true,
			},
		}),
		prisma.review.groupBy({
			by: ["status"],
			where: { userId: user.userId, isDeleted: false },
			_count: { id: true },
		}),
		prisma.review.aggregate({
			where: { userId: user.userId, isDeleted: false, status: ReviewStatus.PUBLISHED },
			_avg: { rating: true },
			_count: { id: true },
		}),
		prisma.payment.aggregate({
			where: { userId: user.userId, status: PaymentStatus.COMPLETED },
			_sum: { amount: true },
		}),
		prisma.payment.count({
			where: {
				userId: user.userId,
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.RENT,
			},
		}),
		prisma.payment.count({
			where: {
				userId: user.userId,
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.BUY,
			},
		}),
		prisma.payment.count({
			where: {
				userId: user.userId,
				status: PaymentStatus.COMPLETED,
				purchaseType: PurchaseType.SUBSCRIPTION,
			},
		}),
		prisma.watchlist.count({ where: { userId: user.userId } }),
		prisma.review.findMany({
			where: { userId: user.userId, isDeleted: false },
			orderBy: { createdAt: "desc" },
			take: 5,
			select: {
				id: true,
				movie: { select: { id: true, title: true } },
				rating: true,
				status: true,
				createdAt: true,
			},
		}),
		prisma.payment.findMany({
			where: { userId: user.userId, status: PaymentStatus.COMPLETED },
			orderBy: { createdAt: "desc" },
			take: 5,
			select: {
				id: true,
				amount: true,
				currency: true,
				purchaseType: true,
				gateway: true,
				createdAt: true,
			},
		}),
	]);

	const reviewStats = {
		pending: reviewStatusTotals.find((item) => item.status === ReviewStatus.PENDING)?._count.id ?? 0,
		published: reviewStatusTotals.find((item) => item.status === ReviewStatus.PUBLISHED)?._count.id ?? 0,
		draft: reviewStatusTotals.find((item) => item.status === ReviewStatus.DRAFT)?._count.id ?? 0,
		unpublished: reviewStatusTotals.find((item) => item.status === ReviewStatus.UNPUBLISHED)?._count.id ?? 0,
		totalReviews: reviewRatingAggregate._count.id,
		averageRatingGiven: Number((reviewRatingAggregate._avg.rating ?? 0).toFixed(2)),
	};

	return {
		summary: {
			totalSpend: Number((paymentTotals._sum.amount ?? 0).toFixed(2)),
			totalRents: rentPaymentCount,
			totalPurchases: buyPaymentCount,
			totalSubscriptions: subscriptionPaymentCount,
			watchlistCount,
			subscriptionStatus: userRecord?.subscriptionStatus ?? null,
		},
		reviewStats,
		recentActivity: {
			recentReviews,
			recentPayments,
		},
	};
};

export const StatsService = {
	getDashboardStatsData,
	getUserStatsData,
};
