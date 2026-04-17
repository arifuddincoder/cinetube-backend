import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { WatchlistController } from "./watchlist.controller";

const router = Router();

router.get("/", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WatchlistController.getMyWatchlist);

router.post("/:movieId", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WatchlistController.addToWatchlist);

router.delete("/clear", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WatchlistController.clearWatchlist);

router.delete("/:movieId", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WatchlistController.removeFromWatchlist);

export const WatchlistRoutes = router;
