import type { Request as ExpressRequest } from "express";

export const toWebHeaders = (reqHeaders: ExpressRequest["headers"]) => {
	const headers = new Headers();

	Object.entries(reqHeaders).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((v) => headers.append(key, v));
		} else if (typeof value === "string") {
			headers.set(key, value);
		}
	});

	return headers;
};
