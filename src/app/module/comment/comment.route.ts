import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CommentController } from "./comment.controller";
import { createCommentZodSchema, updateCommentZodSchema } from "./comment.validation";

const router = Router();

// admin routes
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CommentController.getAllComments);

// public routes
router.get("/review/:reviewId", CommentController.getCommentsByReview);

// user routes
router.post(
	"/",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createCommentZodSchema),
	CommentController.createComment,
);

router.patch(
	"/:id",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateCommentZodSchema),
	CommentController.updateComment,
);

router.delete("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), CommentController.deleteComment);

export const CommentRoutes = router;
