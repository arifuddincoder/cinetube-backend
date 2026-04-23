import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { optionalCheckAuth } from "../../middleware/optionalCheckAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { createReviewZodSchema, updateReviewStatusZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

router.get("/", ReviewController.getAllReviews);
router.get("/admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getAllReviewsForAdmin);
router.get("/my/reviews", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getMyReviews);
router.get(
	"/my/review/:movieId",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	ReviewController.getMyReviewForMovie,
);
router.get("/movie/:movieId", optionalCheckAuth, ReviewController.getReviewsByMovie);
router.get(
	"/movie/:movieId/pending",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	ReviewController.getPendingReviewsForMovie,
);
router.get("/:id", ReviewController.getReviewById);

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
router.patch(
	"/:id/status",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateReviewStatusZodSchema),
	ReviewController.updateReviewStatus,
);
router.delete("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewController.deleteReview);

export const ReviewRoutes = router;
