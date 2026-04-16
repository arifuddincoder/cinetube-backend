import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";

import { prisma } from "./prisma";

export const auth = betterAuth({
	baseURL: envVars.BETTER_AUTH_URL,
	secret: envVars.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},

	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: Role.USER,
			},

			status: {
				type: "string",
				required: true,
				defaultValue: UserStatus.ACTIVE,
			},

			isDeleted: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},

			deletedAt: {
				type: "date",
				required: false,
				defaultValue: null,
			},
		},
	},
	trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5050", envVars.FRONTEND_URL],
});
