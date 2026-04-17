import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { TagController } from "./tag.controller";
import { createTagZodSchema, updateTagZodSchema } from "./tag.validation";

const router = Router();

// public routes
router.get("/", TagController.getAllTags);
router.get("/:id", TagController.getTagById);

// admin only routes
router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createTagZodSchema), TagController.createTag);

router.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateTagZodSchema),
	TagController.updateTag,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TagController.deleteTag);

router.delete("/hard/:id", checkAuth(Role.SUPER_ADMIN), TagController.hardDeleteTag);

export const TagRoutes = router;
