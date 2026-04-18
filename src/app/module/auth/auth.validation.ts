import z from "zod";

export const registerUserZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters"),
	email: z.email("Email must be a valid email address"),
	password: z
		.string("Password must be a string")
		.min(6, "Password must be at least 6 characters")
		.max(32, "Password must be at most 32 characters"),
});

export const loginUserZodSchema = z.object({
	email: z.email("Email must be a valid email address"),
	password: z.string("Password must be a string").min(1, "Password is required"),
});

export const verifyEmailZodSchema = z.object({
	email: z.email("Email must be a valid email address"),
	otp: z.string("OTP must be a string").length(6, "OTP must be exactly 6 characters"),
});

export const forgetPasswordZodSchema = z.object({
	email: z.email("Email must be a valid email address"),
});

export const resetPasswordZodSchema = z.object({
	email: z.email("Email must be a valid email address"),
	otp: z.string("OTP must be a string").length(6, "OTP must be exactly 6 characters"),
	newPassword: z
		.string("Password must be a string")
		.min(6, "Password must be at least 6 characters")
		.max(32, "Password must be at most 32 characters"),
});

export const changePasswordZodSchema = z.object({
	currentPassword: z.string("Current password must be a string").min(1, "Current password is required"),
	newPassword: z
		.string("New password must be a string")
		.min(6, "New password must be at least 6 characters")
		.max(32, "New password must be at most 32 characters"),
});

export const resendOtpZodSchema = z.object({
	email: z.string().email("Invalid email address"),
});
