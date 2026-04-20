import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
	"/",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	StatsController.getDashboardStatsData,
);

router.get(
	"/me",
	checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
	StatsController.getUserStatsData,
);

export const StatsRoutes = router;
