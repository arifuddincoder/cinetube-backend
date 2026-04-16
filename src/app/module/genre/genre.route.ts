import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { GenreController } from "./genre.controller";
import { createGenreZodSchema, updateGenreZodSchema } from "./genre.validation";

const router = Router();

router.get("/", GenreController.getAllGenres);
router.get("/:id", GenreController.getGenreById);

router.post(
	"/",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(createGenreZodSchema),
	GenreController.createGenre,
);

router.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(updateGenreZodSchema),
	GenreController.updateGenre,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), GenreController.deleteGenre);

export const GenreRoutes = router;
