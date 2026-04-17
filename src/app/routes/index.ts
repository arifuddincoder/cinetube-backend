import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { AdminRoutes } from "../module/admin/admin.route";
import { GenreRoutes } from "../module/genre/genre.route";
import { PlatformRoutes } from "../module/platform/platform.route";
import { TagRoutes } from "../module/tag/tag.route";
import { MovieRoutes } from "../module/movie/movie.route";
import { CastMemberRoutes } from "../module/castMember/castMember.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/admins", AdminRoutes);
router.use("/genres", GenreRoutes);
router.use("/platforms", PlatformRoutes);
router.use("/tags", TagRoutes);
router.use("/movies", MovieRoutes);
router.use("/cast-members", CastMemberRoutes);
export const IndexRoutes = router;
