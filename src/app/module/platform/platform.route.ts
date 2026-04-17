import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PlatformController } from "./platform.controller";
import { createPlatformZodSchema, updatePlatformZodSchema } from "./platform.validation";

const router = Router();

// public routes
router.get("/", PlatformController.getAllPlatforms);
router.get("/:id", PlatformController.getPlatformById);

// admin only routes
router.post(
	"/",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createPlatformZodSchema),
	PlatformController.createPlatform,
);

router.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updatePlatformZodSchema),
	PlatformController.updatePlatform,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PlatformController.deletePlatform);

router.delete("/hard/:id", checkAuth(Role.SUPER_ADMIN), PlatformController.hardDeletePlatform);

export const PlatformRoutes = router;
