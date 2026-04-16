// validateRequest.ts
import { NextFunction, Request, Response } from "express";
import z from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateRequest = (zodSchema: z.ZodObject<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.body.data) {
			req.body = JSON.parse(req.body.data);
		}

		const parsedResult = zodSchema.safeParse(req.body); // req.body

		if (!parsedResult.success) {
			return next(parsedResult.error);
		}

		req.body = parsedResult.data;

		next();
	};
};
