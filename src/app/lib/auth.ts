import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "./prisma";
import { sendEmail } from "../utils/email";
import { COOKIE_NAMES } from "../utils/cookie.constants";

export const auth = betterAuth({
	// ✅ baseURL = auth handler এর full path
	baseURL: "https://cinetube.arifuddincoder.site/api/auth",
	trustedOrigins: [envVars.FRONTEND_URL],
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
			// ✅ baseURL তে /api/auth আছে, তাই শুধু /callback/google
			redirectURI: "https://cinetube.arifuddincoder.site/api/auth/callback/google",
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
						templateData: { newEmail, url },
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
			imagePublicId: {
				type: "string",
				required: false,
				defaultValue: null,
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
		expiresIn: 60 * 60 * 24, // ✅ fix: আগে 60*60*60*24 ছিলো = 216000 hrs!
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24,
		},
	},

	advanced: {
		useSecureCookies: true,
		crossSubDomainCookies: {
			enabled: false,
		},
		cookies: {
			session_token: {
				name: COOKIE_NAMES.SESSION_TOKEN,
				attributes: {
					httpOnly: true,
					secure: true,
					sameSite: "lax", // ✅ same domain এ lax যথেষ্ট
					path: "/",
				},
			},
			state: {
				name: COOKIE_NAMES.STATE,
				attributes: {
					httpOnly: true,
					secure: true,
					sameSite: "lax", // ✅
					path: "/",
				},
			},
		},
	},

	plugins: [
		bearer(),
		emailOTP({
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "email-verification") {
					const user = await prisma.user.findUnique({ where: { email } });

					if (!user) {
						console.error(`User with email ${email} not found.`);
						return;
					}
					if (user.role === Role.SUPER_ADMIN) {
						console.log(`Super admin detected. Skipping OTP.`);
						return;
					}
					if (!user.emailVerified) {
						await sendEmail({
							to: email,
							subject: "Verify your email",
							templateName: "otp",
							templateData: { name: user.name, otp },
						});
					}
				} else if (type === "forget-password") {
					const user = await prisma.user.findUnique({ where: { email } });
					if (user) {
						await sendEmail({
							to: email,
							subject: "Password Reset OTP",
							templateName: "forgot-password",
							templateData: { name: user.name, otp },
						});
					}
				}
			},
			expiresIn: 2 * 60,
			otpLength: 6,
		}),
	],
});
