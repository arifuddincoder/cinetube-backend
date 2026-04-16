import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { envVars } from "./app/config/env";
import { IndexRoutes } from "./app/routes";
import qs from "qs";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
// Better Auth handler
app.use("/api/auth", toNodeHandler(auth));

// CORS
app.use(
	cors({
		origin: [envVars.FRONTEND_URL, "http://localhost:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", IndexRoutes);

// Error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
