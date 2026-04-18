import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
	registerUserZodSchema,
	loginUserZodSchema,
	verifyEmailZodSchema,
	forgetPasswordZodSchema,
	resetPasswordZodSchema,
	changePasswordZodSchema,
	resendOtpZodSchema,
} from "./auth.validation";
import { Role } from "../../../generated/prisma/browser";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post("/register", validateRequest(registerUserZodSchema), AuthController.registerUser);
router.post("/login", validateRequest(loginUserZodSchema), AuthController.loginUser);
router.post("/verify-email", validateRequest(verifyEmailZodSchema), AuthController.verifyEmail);
router.post("/resend-otp", validateRequest(resendOtpZodSchema), AuthController.resendOtp);
router.post("/forget-password", validateRequest(forgetPasswordZodSchema), AuthController.forgetPassword);
router.post("/reset-password", validateRequest(resetPasswordZodSchema), AuthController.resetPassword);
router.post(
	"/change-password",
	checkAuth(Role.ADMIN, Role.USER, Role.SUPER_ADMIN),
	validateRequest(changePasswordZodSchema),
	AuthController.changePassword,
);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/logout", checkAuth(Role.ADMIN, Role.USER, Role.SUPER_ADMIN), AuthController.logoutUser);
router.get("/me", checkAuth(Role.ADMIN, Role.USER, Role.SUPER_ADMIN), AuthController.getMe);

// Google OAuth
router.get("/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/google/error", AuthController.handleOAuthError);

export const AuthRoutes = router;
