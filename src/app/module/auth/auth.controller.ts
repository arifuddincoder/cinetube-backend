import { Request, Response } from "express";
import status from "http-status";

import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";
import { toWebHeaders } from "../../utils/toWebHeaders";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await AuthService.registerUser(payload);

	const { accessToken, refreshToken, token, ...rest } = result;

	tokenUtils.setAccessTokenCookie(res, accessToken);
	tokenUtils.setRefreshTokenCookie(res, refreshToken);
	tokenUtils.setBetterAuthSessionCookie(res, token as string);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "User registered successfully",
		data: {
			token,
			accessToken,
			refreshToken,
			...rest,
		},
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.loginUser(payload);
	const { accessToken, refreshToken, token, ...rest } = result;

	tokenUtils.setAccessTokenCookie(res, accessToken);
	tokenUtils.setRefreshTokenCookie(res, refreshToken);
	tokenUtils.setBetterAuthSessionCookie(res, token);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			token,
			accessToken,
			refreshToken,
			...rest,
		},
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await AuthService.getMe(user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
	const refreshToken = req.cookies.refreshToken;
	const betterAuthSessionToken = req.cookies["better-auth.session_token"];

	if (!refreshToken) {
		throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
	}

	const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

	const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

	tokenUtils.setAccessTokenCookie(res, accessToken);
	tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
	tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "New tokens generated successfully",
		data: {
			accessToken,
			refreshToken: newRefreshToken,
			sessionToken,
		},
	});
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const betterAuthSessionToken = req.cookies["better-auth.session_token"];

	const result = await AuthService.changePassword(payload, betterAuthSessionToken);

	const { accessToken, refreshToken, token } = result;

	tokenUtils.setAccessTokenCookie(res, accessToken);
	tokenUtils.setRefreshTokenCookie(res, refreshToken);
	tokenUtils.setBetterAuthSessionCookie(res, token as string);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Password changed successfully",
		data: result,
	});
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
	const betterAuthSessionToken = req.cookies["better-auth.session_token"];
	const result = await AuthService.logoutUser(betterAuthSessionToken);

	CookieUtils.clearCookie(res, "accessToken", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});
	CookieUtils.clearCookie(res, "refreshToken", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});
	CookieUtils.clearCookie(res, "better-auth.session_token", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "User logged out successfully",
		data: result,
	});
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	const { email, otp } = req.body;
	await AuthService.verifyEmail(email, otp);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Email verified successfully",
	});
});
const resendOtp = catchAsync(async (req: Request, res: Response) => {
	const { email } = req.body;
	await AuthService.resendOtp(email);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "OTP sent successfully",
	});
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
	const { email } = req.body;
	await AuthService.forgetPassword(email);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Password reset OTP sent to email successfully",
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const { email, otp, newPassword } = req.body;
	await AuthService.resetPassword(email, otp, newPassword);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Password reset successfully",
	});
});

const googleLogin = catchAsync((req: Request, res: Response) => {
	const redirectPath = (req.query.redirect as string) || "/dashboard";

	const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodeURIComponent(
		redirectPath,
	)}`;

	const html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Redirecting...</title>
		</head>
		<body>
			<p>Redirecting to Google...</p>
			<script>
				window.onload = async function () {
					try {
						const response = await fetch("${envVars.BETTER_AUTH_URL}/api/auth/sign-in/social", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							credentials: "include",
							body: JSON.stringify({
								provider: "google",
								callbackURL: "${callbackURL}"
							})
						});

						const data = await response.json();

						if (data?.url) {
							window.location.href = data.url;
						} else {
							window.location.href = "${envVars.FRONTEND_URL}/login?error=oauth_failed";
						}
					} catch (error) {
						window.location.href = "${envVars.FRONTEND_URL}/login?error=oauth_failed";
					}
				};
			</script>
		</body>
		</html>
	`;

	res.status(200).send(html);
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
	const redirectPath = (req.query.redirect as string) || "/dashboard";

	const sessionToken = req.cookies["better-auth.session_token"] || req.cookies["__Secure-better-auth.session_token"];

	if (!sessionToken) {
		return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
	}

	const session = await auth.api.getSession({
		headers: {
			Cookie: `better-auth.session_token=${sessionToken}`,
		},
	});

	if (!session) {
		return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
	}

	if (!session.user) {
		return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
	}

	const result = await AuthService.googleLoginSuccess(session);
	const { accessToken, refreshToken } = result;

	const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
	const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

	const callbackUrl =
		`${envVars.FRONTEND_URL}/auth/google/callback` +
		`?accessToken=${encodeURIComponent(accessToken)}` +
		`&refreshToken=${encodeURIComponent(refreshToken)}` +
		`&redirect=${encodeURIComponent(finalRedirectPath)}`;

	return res.redirect(callbackUrl);
});

const handleOAuthError = catchAsync((req: Request, res: Response) => {
	const error = (req.query.error as string) || "oauth_failed";
	res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
	registerUser,
	loginUser,
	getMe,
	getNewToken,
	changePassword,
	logoutUser,
	verifyEmail,
	forgetPassword,
	resetPassword,
	googleLogin,
	googleLoginSuccess,
	handleOAuthError,
	resendOtp,
};
