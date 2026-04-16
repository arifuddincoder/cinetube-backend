import z from "zod";
import { Role, UserStatus } from "../../../generated/prisma/enums";

export const createAdminZodSchema = z.object({
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

export const updateAdminZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters")
		.max(50, "Name must be at most 50 characters")
		.optional(),
	image: z.url("Image must be a valid URL").optional(),
});

export const changeUserStatusZodSchema = z.object({
	userId: z.string("User ID must be a string").min(1, "User ID is required"),
	status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED], {
		error: "Status must be ACTIVE, BLOCKED or DELETED",
	}),
});

export const changeUserRoleZodSchema = z.object({
	userId: z.string("User ID must be a string").min(1, "User ID is required"),
	role: z.enum([Role.USER, Role.ADMIN, Role.SUPER_ADMIN], {
		error: "Role must be USER, ADMIN or SUPER_ADMIN",
	}),
});
