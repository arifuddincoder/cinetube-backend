import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { ReviewLikeController } from "./reviewLike.controller";

const router = Router();

router.get("/:reviewId", ReviewLikeController.getReviewLikes);

router.post("/:reviewId", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), ReviewLikeController.toggleLike);

export const ReviewLikeRoutes = router;
