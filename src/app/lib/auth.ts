import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "./prisma";
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
	baseURL: envVars.BETTER_AUTH_URL,
	trustedOrigins: [envVars.FRONTEND_URL!, envVars.BETTER_AUTH_URL!],
	secret: envVars.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},

	socialProviders: {
		google: {
			clientId: envVars.GOOGLE_CLIENT_ID,
			clientSecret: envVars.GOOGLE_CLIENT_SECRET,
			mapProfileToUser: () => {
				return {
					role: Role.USER,
					status: UserStatus.ACTIVE,
					needPasswordChange: false,
					emailVerified: true,
					isDeleted: false,
					deletedAt: null,
				};
			},
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
	},

	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async ({ newEmail, url }: { newEmail: string; url: string }) => {
				try {
					await sendEmail({
						to: newEmail,
						subject: "Verify your new email - CineTube",
						templateName: "change-email",
						templateData: {
							newEmail,
							url,
						},
					});
				} catch (error) {
					console.error("[changeEmail] Failed to send verification email:", error);
				}
			},
		},
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
			needPasswordChange: {
				type: "boolean",
				required: true,
				defaultValue: false,
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

	session: {
		expiresIn: 60 * 60 * 60 * 24,
		updateAge: 60 * 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 60 * 24,
		},
	},

	// advanced: {
	// 	useSecureCookies: false,
	// 	cookies: {
	// 		state: {
	// 			attributes: {
	// 				sameSite: "none",
	// 				secure: true,
	// 				httpOnly: true,
	// 				path: "/",
	// 			},
	// 		},
	// 		sessionToken: {
	// 			attributes: {
	// 				sameSite: "none",
	// 				secure: true,
	// 				httpOnly: true,
	// 				path: "/",
	// 			},
	// 		},
	// 	},
	// },

	advanced: {
		cookies: {
			session_token: {
				name: "session_token",
				attributes: {
					httpOnly: true,
					secure: true,
					sameSite: "none",
					path: "/",
				},
			},
			state: {
				attributes: {
					httpOnly: true,
					secure: true,
					sameSite: "none",
					path: "/",
				},
			},
		},
	},

	plugins: [
		bearer(),
		oAuthProxy(),
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "email-verification") {
					const user = await prisma.user.findUnique({
						where: {
							email,
						},
					});

					if (!user) {
						console.error(`User with email ${email} not found. Cannot send verification OTP.`);
						return;
					}

					if (user && user.role === Role.SUPER_ADMIN) {
						console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
						return;
					}

					if (user && !user.emailVerified) {
						sendEmail({
							to: email,
							subject: "Verify your email",
							templateName: "otp",
							templateData: {
								name: user.name,
								otp,
							},
						});
					}
				} else if (type === "forget-password") {
					const user = await prisma.user.findUnique({
						where: {
							email,
						},
					});

					if (user) {
						sendEmail({
							to: email,
							subject: "Password Reset OTP",
							templateName: "forgot-password",
							templateData: {
								name: user.name,
								otp,
							},
						});
					}
				}
			},
			expiresIn: 2 * 60,
			otpLength: 6,
		}),
	],
});
