import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import {
	updateUserZodSchema,
	changeEmailZodSchema,
	changeUserStatusZodSchema,
	changeUserRoleZodSchema,
} from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.patch(
	"/change-user-status",
	checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
	validateRequest(changeUserStatusZodSchema),
	UserController.changeUserStatus,
);

router.patch(
	"/change-user-role",
	checkAuth(Role.SUPER_ADMIN),
	validateRequest(changeUserRoleZodSchema),
	UserController.changeUserRole,
);

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

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.deleteUser);

router.delete("/hard/:id", checkAuth(Role.SUPER_ADMIN), UserController.hardDeleteUser);

export const UserRoutes = router;
