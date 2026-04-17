import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CastMemberController } from "./castMember.controller";
import { createCastMemberZodSchema, updateCastMemberZodSchema } from "./castMember.validation";

const router = Router();

router.get("/", CastMemberController.getAllCastMembers);
router.get("/:id", CastMemberController.getCastMemberById);

router.post(
	"/",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createCastMemberZodSchema),
	CastMemberController.createCastMember,
);

router.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateCastMemberZodSchema),
	CastMemberController.updateCastMember,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CastMemberController.deleteCastMember);

export const CastMemberRoutes = router;
