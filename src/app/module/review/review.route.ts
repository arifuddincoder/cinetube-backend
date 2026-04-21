import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { optionalCheckAuth } from "../../middleware/optionalCheckAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewZodSchema, updateReviewStatusZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

router.get("/", ReviewController.getAllReviews);
router.get("/:id", ReviewController.getReviewById);

router.get("/my/reviews", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getMyReviews);

router.post(
	"/",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createReviewZodSchema),
	ReviewController.createReview,
);

router.patch(
	"/:id",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateReviewZodSchema),
	ReviewController.updateReview,
);

router.patch("/:id/submit", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewController.submitReview);

router.delete("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewController.deleteReview);

router.patch(
	"/:id/status",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateReviewStatusZodSchema),
	ReviewController.updateReviewStatus,
);
router.get("/movie/:movieId", optionalCheckAuth, ReviewController.getReviewsByMovie);

export const ReviewRoutes = router;
