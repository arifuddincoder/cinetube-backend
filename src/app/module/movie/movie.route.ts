import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { MovieController } from "./movie.controller";
import { createMovieZodSchema, updateMovieZodSchema } from "./movie.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.get("/filters", MovieController.getMovieFilters);
router.get("/", MovieController.getAllMovies);
router.get("/top-rated", MovieController.getTopRatedMovies);
router.get("/:id", MovieController.getMovieById);

router.post(
	"/",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.single("file"),
	validateRequest(createMovieZodSchema),
	MovieController.createMovie,
);

router.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.single("file"),
	validateRequest(updateMovieZodSchema),
	MovieController.updateMovie,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MovieController.deleteMovie);

router.delete("/hard/:id", checkAuth(Role.SUPER_ADMIN), MovieController.hardDeleteMovie);

export const MovieRoutes = router;
