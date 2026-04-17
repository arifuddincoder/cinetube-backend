/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const query = req.query as IQueryParams;
	const result = await PaymentService.getMyPayments(user, query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Payments fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as IQueryParams;
	const result = await PaymentService.getAllPayments(query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "All payments fetched successfully",
		data: result.data,
		meta: result.meta,
	});
});

const createSubscriptionCheckout = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;
	const result = await PaymentService.createSubscriptionCheckout(user, payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Subscription checkout created successfully",
		data: result,
	});
});

const createRentOrBuyCheckout = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const payload = req.body;
	const result = await PaymentService.createRentOrBuyCheckout(user, payload);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Checkout created successfully",
		data: result,
	});
});

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
	const signature = req.headers["stripe-signature"] as string;
	const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret) {
		return res.status(status.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
	} catch (error: any) {
		console.error("Error processing Stripe webhook:", error);
		return res.status(status.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
	}

	try {
		const result = await PaymentService.handleStripeWebhookEvent(event);
		sendResponse(res, {
			httpStatusCode: status.OK,
			success: true,
			message: "Stripe webhook event processed successfully",
			data: result,
		});
	} catch (error) {
		console.error("Error handling Stripe webhook event:", error);
		sendResponse(res, {
			httpStatusCode: status.INTERNAL_SERVER_ERROR,
			success: false,
			message: "Error handling Stripe webhook event",
		});
	}
});

const checkMovieAccess = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const { movieId } = req.params;
	const result = await PaymentService.checkMovieAccess(user, movieId as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Movie access checked successfully",
		data: result,
	});
});

export const PaymentController = {
	getMyPayments,
	getAllPayments,
	createSubscriptionCheckout,
	createRentOrBuyCheckout,
	handleStripeWebhookEvent,
	checkMovieAccess,
};
