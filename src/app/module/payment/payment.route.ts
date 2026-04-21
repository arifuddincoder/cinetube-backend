import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { createRentOrBuyZodSchema, createSubscriptionZodSchema } from "./payment.validation";

const router = Router();

router.get("/my-payments", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getMyPayments);

router.post(
	"/subscribe",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createSubscriptionZodSchema),
	PaymentController.createSubscriptionCheckout,
);

router.post(
	"/checkout",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createRentOrBuyZodSchema),
	PaymentController.createRentOrBuyCheckout,
);

router.get("/access/:movieId", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), PaymentController.checkMovieAccess);

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getAllPayments);

export const PaymentRoutes = router;
