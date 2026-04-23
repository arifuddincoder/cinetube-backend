import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { Role } from "../../generated/prisma/enums";
import { COOKIE_NAMES } from "../utils/cookie.constants";

export const optionalCheckAuth = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const sessionToken = CookieUtils.getCookie(req, COOKIE_NAMES.SESSION_TOKEN);
		const accessToken = CookieUtils.getCookie(req, COOKIE_NAMES.ACCESS_TOKEN);

		if (accessToken) {
			const verified = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
			if (verified.success && verified.data) {
				req.user = {
					userId: verified.data.userId,
					role: verified.data.role as Role,
					email: verified.data.email,
				};
				return next();
			}
		}

		if (sessionToken) {
			const session = await prisma.session.findFirst({
				where: { token: sessionToken, expiresAt: { gt: new Date() } },
				include: { user: true },
			});
			if (session?.user) {
				req.user = {
					userId: session.user.id,
					role: session.user.role as Role,
					email: session.user.email,
				};
			}
		}
	} catch {
		// silently ignore — optional auth
	}
	next();
};
