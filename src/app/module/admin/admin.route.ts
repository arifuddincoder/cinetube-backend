import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import { createAdminZodSchema, updateAdminZodSchema } from "./admin.validation";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllAdmins);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAdminById);

router.post(
	"/",
	checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
	validateRequest(createAdminZodSchema),
	AdminController.createAdmin,
);

router.patch("/:id", checkAuth(Role.SUPER_ADMIN), validateRequest(updateAdminZodSchema), AdminController.updateAdmin);

router.delete("/:id", checkAuth(Role.SUPER_ADMIN), AdminController.deleteAdmin);

router.delete("/hard/:id", checkAuth(Role.SUPER_ADMIN), AdminController.hardDeleteAdmin);

export const AdminRoutes = router;
