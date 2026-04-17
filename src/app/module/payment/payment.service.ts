/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus, PlanType, PurchaseType, RentalDuration } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { sendEmail } from "../../utils/email";
import { ICreateRentOrBuyPayload, ICreateSubscriptionPayload } from "./payment.interface";
import { generateInvoicePdf } from "./payment.utils";
import status from "http-status";

const SUBSCRIPTION_PRICES = {
	[PlanType.MONTHLY]: {
		priceId: envVars.STRIPE.STRIPE_MONTHLY_PRICE_ID,
		amount: 299,
		days: 30,
	},
	[PlanType.YEARLY]: {
		priceId: envVars.STRIPE.STRIPE_YEARLY_PRICE_ID,
		amount: 2499,
		days: 365,
	},
};

const RENTAL_DAYS = {
	[RentalDuration.DAYS_1]: 1,
	[RentalDuration.DAYS_7]: 7,
};

const getMyPayments = async (user: IRequestUser, query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.payment, query, {
		searchableFields: [],
		filterableFields: ["status", "purchaseType", "planType"],
	})
		.where({ userId: user.userId })
		.include({
			movie: {
				select: {
					id: true,
					title: true,
					posterImage: true,
				},
			},
		})
		.sort()
		.paginate()
		.execute();

	return result;
};

const getAllPayments = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.payment, query, {
		searchableFields: [],
		filterableFields: ["status", "purchaseType", "planType", "userId"],
	})
		.include({
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			movie: {
				select: {
					id: true,
					title: true,
				},
			},
		})
		.sort()
		.paginate()
		.execute();

	return result;
};

const createSubscriptionCheckout = async (user: IRequestUser, payload: ICreateSubscriptionPayload) => {
	const { planType } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { id: user.userId },
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	const priceConfig = SUBSCRIPTION_PRICES[planType];

	// create or get stripe customer
	let stripeCustomerId = isUserExist.stripeCustomerId;

	if (!stripeCustomerId) {
		const customer = await stripe.customers.create({
			email: isUserExist.email,
			name: isUserExist.name,
		});
		stripeCustomerId = customer.id;

		await prisma.user.update({
			where: { id: user.userId },
			data: { stripeCustomerId },
		});
	}

	// create payment record
	const payment = await prisma.payment.create({
		data: {
			userId: user.userId,
			amount: priceConfig.amount,
			purchaseType: PurchaseType.SUBSCRIPTION,
			planType,
			status: PaymentStatus.PENDING,
			stripeCustomerId,
		},
	});

	// create stripe checkout session
	const session = await stripe.checkout.sessions.create({
		customer: stripeCustomerId,
		payment_method_types: ["card"],
		line_items: [
			{
				price: priceConfig.priceId,
				quantity: 1,
			},
		],
		mode: "subscription",
		success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
		metadata: {
			paymentId: payment.id,
			userId: user.userId,
			planType,
		},
	});

	// update payment with session id
	await prisma.payment.update({
		where: { id: payment.id },
		data: { stripeSessionId: session.id },
	});

	return { checkoutUrl: session.url, sessionId: session.id };
};

const createRentOrBuyCheckout = async (user: IRequestUser, payload: ICreateRentOrBuyPayload) => {
	const { movieId, purchaseType, rentalDuration } = payload;

	if (purchaseType === PurchaseType.RENT && !rentalDuration) {
		throw new AppError(status.BAD_REQUEST, "Rental duration is required for rent");
	}

	const movie = await prisma.movie.findUnique({
		where: { id: movieId, isDeleted: false },
	});

	if (!movie) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	if (purchaseType === PurchaseType.RENT && movie.rentPrice === 0) {
		throw new AppError(status.BAD_REQUEST, "This movie is not available for rent");
	}

	if (purchaseType === PurchaseType.BUY && movie.buyPrice === 0) {
		throw new AppError(status.BAD_REQUEST, "This movie is not available for purchase");
	}

	// check if already bought
	if (purchaseType === PurchaseType.BUY) {
		const existingPurchase = await prisma.payment.findFirst({
			where: {
				userId: user.userId,
				movieId,
				purchaseType: PurchaseType.BUY,
				status: PaymentStatus.COMPLETED,
			},
		});

		if (existingPurchase) {
			throw new AppError(status.CONFLICT, "You have already purchased this movie");
		}
	}

	const isUserExist = await prisma.user.findUnique({
		where: { id: user.userId },
	});

	if (!isUserExist) {
		throw new AppError(status.NOT_FOUND, "User not found");
	}

	const amount = purchaseType === PurchaseType.RENT ? movie.rentPrice : movie.buyPrice;

	// create or get stripe customer
	let stripeCustomerId = isUserExist.stripeCustomerId;

	if (!stripeCustomerId) {
		const customer = await stripe.customers.create({
			email: isUserExist.email,
			name: isUserExist.name,
		});
		stripeCustomerId = customer.id;

		await prisma.user.update({
			where: { id: user.userId },
			data: { stripeCustomerId },
		});
	}

	// create payment record
	const payment = await prisma.payment.create({
		data: {
			userId: user.userId,
			movieId,
			amount,
			purchaseType,
			rentalDuration: purchaseType === PurchaseType.RENT ? rentalDuration : null,
			status: PaymentStatus.PENDING,
			stripeCustomerId,
		},
	});

	// create stripe checkout session
	const session = await stripe.checkout.sessions.create({
		customer: stripeCustomerId,
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "bdt",
					product_data: {
						name: `${movie.title} - ${purchaseType === PurchaseType.RENT ? `Rent (${rentalDuration})` : "Buy"}`,
					},
					unit_amount: Math.round(amount * 100), // Stripe amount in paisa
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${envVars.FRONTEND_URL}/payment/cancel`,
		metadata: {
			paymentId: payment.id,
			userId: user.userId,
			movieId,
			purchaseType,
			rentalDuration: rentalDuration || "",
		},
	});

	// update payment with session id
	await prisma.payment.update({
		where: { id: payment.id },
		data: { stripeSessionId: session.id },
	});

	return { checkoutUrl: session.url, sessionId: session.id };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
	// idempotency check
	const existingPayment = await prisma.payment.findFirst({
		where: { stripeEventId: event.id },
	});

	if (existingPayment) {
		console.log(`Event ${event.id} already processed. Skipping`);
		return { message: `Event ${event.id} already processed. Skipping` };
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as any;
			const { paymentId, userId, planType, movieId, purchaseType, rentalDuration } = session.metadata;

			if (!paymentId || !userId) {
				console.error("Missing metadata in webhook event");
				return { message: "Missing metadata" };
			}

			const payment = await prisma.payment.findUnique({
				where: { id: paymentId },
				include: { user: true, movie: true },
			});

			if (!payment) {
				console.error(`Payment ${paymentId} not found`);
				return { message: "Payment not found" };
			}

			let pdfBuffer: Buffer | null = null;

			const result = await prisma.$transaction(async (tx) => {
				let subscriptionEndsAt: Date | null = null;
				let rentExpiresAt: Date | null = null;
				let subscriptionId: string | null = null;

				// subscription handling
				if (purchaseType === PurchaseType.SUBSCRIPTION && planType) {
					const days = SUBSCRIPTION_PRICES[planType as PlanType].days;
					subscriptionEndsAt = new Date();
					subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + days);
					subscriptionId = session.subscription || null;

					await tx.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "ACTIVE",
							subscriptionEndsAt,
						},
					});
				}

				// rent handling
				if (purchaseType === PurchaseType.RENT && rentalDuration) {
					const days = RENTAL_DAYS[rentalDuration as RentalDuration];
					rentExpiresAt = new Date();
					rentExpiresAt.setDate(rentExpiresAt.getDate() + days);
				}

				// generate invoice pdf
				let invoiceUrl = null;
				try {
					pdfBuffer = await generateInvoicePdf({
						invoiceId: paymentId,
						userName: payment.user.name,
						userEmail: payment.user.email,
						purchaseType: payment.purchaseType,
						planType: planType || undefined,
						movieTitle: payment.movie?.title || undefined,
						amount: payment.amount,
						transactionId: session.payment_intent || session.id,
						paymentDate: new Date().toISOString(),
						rentExpiresAt: rentExpiresAt?.toISOString(),
						subscriptionEndsAt: subscriptionEndsAt?.toISOString(),
					});

					const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, `invoice-${paymentId}-${Date.now()}.pdf`);

					invoiceUrl = cloudinaryResponse?.secure_url;
				} catch (pdfError) {
					console.error("Error generating invoice PDF:", pdfError);
				}

				const updatedPayment = await tx.payment.update({
					where: { id: paymentId },
					data: {
						status: PaymentStatus.COMPLETED,
						transactionId: session.payment_intent || session.id,
						subscriptionId,
						subscriptionEndsAt,
						rentExpiresAt,
						stripeEventId: event.id,
						invoiceUrl,
					},
				});

				return { updatedPayment, invoiceUrl };
			});

			// send invoice email
			if (result.invoiceUrl) {
				try {
					await sendEmail({
						to: payment.user.email,
						subject: `Payment Confirmation & Invoice - CineTube`,
						templateName: "invoice",
						templateData: {
							userName: payment.user.name,
							invoiceId: paymentId,
							transactionId: session.payment_intent || session.id,
							paymentDate: new Date().toLocaleDateString(),
							purchaseType: payment.purchaseType,
							planType: planType || null,
							movieTitle: payment.movie?.title || null,
							amount: payment.amount,
							invoiceUrl: result.invoiceUrl,
						},
						attachments: [
							{
								filename: `Invoice-${paymentId}.pdf`,
								content: pdfBuffer || Buffer.from(""),
								contentType: "application/pdf",
							},
						],
					});
				} catch (emailError) {
					console.error("Error sending invoice email:", emailError);
				}
			}

			break;
		}

		case "invoice.paid": {
			// subscription renewal
			const invoice = event.data.object as any;
			const subscriptionId = invoice.subscription;

			if (!subscriptionId) break;

			const payment = await prisma.payment.findFirst({
				where: { subscriptionId },
				include: { user: true },
			});

			if (!payment) break;

			const planType = payment.planType as PlanType;
			const days = SUBSCRIPTION_PRICES[planType].days;
			const subscriptionEndsAt = new Date();
			subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + days);

			await prisma.$transaction([
				prisma.payment.create({
					data: {
						userId: payment.userId,
						amount: SUBSCRIPTION_PRICES[planType].amount,
						purchaseType: PurchaseType.SUBSCRIPTION,
						planType,
						status: PaymentStatus.COMPLETED,
						subscriptionId,
						subscriptionEndsAt,
						stripeEventId: event.id,
						transactionId: invoice.payment_intent,
						stripeCustomerId: payment.stripeCustomerId,
					},
				}),
				prisma.user.update({
					where: { id: payment.userId },
					data: {
						subscriptionStatus: "ACTIVE",
						subscriptionEndsAt,
					},
				}),
			]);

			break;
		}

		case "invoice.payment_failed": {
			// subscription payment failed
			const invoice = event.data.object as any;
			const subscriptionId = invoice.subscription;

			if (!subscriptionId) break;

			const payment = await prisma.payment.findFirst({
				where: { subscriptionId },
			});

			if (!payment) break;

			await prisma.user.update({
				where: { id: payment.userId },
				data: { subscriptionStatus: "PAST_DUE" },
			});

			break;
		}

		case "customer.subscription.deleted": {
			// subscription cancelled
			const subscription = event.data.object as any;

			const payment = await prisma.payment.findFirst({
				where: { subscriptionId: subscription.id },
			});

			if (!payment) break;

			await prisma.user.update({
				where: { id: payment.userId },
				data: {
					subscriptionStatus: "CANCELLED",
					subscriptionEndsAt: null,
				},
			});

			break;
		}

		default:
			console.log(`Unhandled event type ${event.type}`);
	}

	return { message: `Webhook Event ${event.id} processed successfully` };
};

const checkMovieAccess = async (user: IRequestUser, movieId: string) => {
	const movie = await prisma.movie.findUnique({
		where: { id: movieId, isDeleted: false },
	});

	if (!movie) {
		throw new AppError(status.NOT_FOUND, "Movie not found");
	}

	// free movie
	if (movie.pricingType === "FREE") {
		return { hasAccess: true, accessType: "FREE" };
	}

	const userRecord = await prisma.user.findUnique({
		where: { id: user.userId },
	});

	// active subscription
	if (
		userRecord?.subscriptionStatus === "ACTIVE" &&
		userRecord?.subscriptionEndsAt &&
		userRecord.subscriptionEndsAt > new Date()
	) {
		return { hasAccess: true, accessType: "SUBSCRIPTION" };
	}

	// bought
	const bought = await prisma.payment.findFirst({
		where: {
			userId: user.userId,
			movieId,
			purchaseType: PurchaseType.BUY,
			status: PaymentStatus.COMPLETED,
		},
	});

	if (bought) {
		return { hasAccess: true, accessType: "BOUGHT" };
	}

	// rented and not expired
	const rented = await prisma.payment.findFirst({
		where: {
			userId: user.userId,
			movieId,
			purchaseType: PurchaseType.RENT,
			status: PaymentStatus.COMPLETED,
			rentExpiresAt: { gt: new Date() },
		},
	});

	if (rented) {
		return { hasAccess: true, accessType: "RENTED", expiresAt: rented.rentExpiresAt };
	}

	return { hasAccess: false };
};

export const PaymentService = {
	getMyPayments,
	getAllPayments,
	createSubscriptionCheckout,
	createRentOrBuyCheckout,
	handleStripeWebhookEvent,
	checkMovieAccess,
};
