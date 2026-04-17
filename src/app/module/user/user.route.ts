import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { updateUserZodSchema, changeEmailZodSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUsers);

router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getUserById);

router.patch(
	"/update-profile",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.single("file"),
	validateRequest(updateUserZodSchema),
	UserController.updateMyProfile,
);

router.patch(
	"/change-email",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(changeEmailZodSchema),
	UserController.changeEmail,
);

export const UserRoutes = router;
