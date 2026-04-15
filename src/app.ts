import express, { Application } from "express";

const app: Application = express();
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Server is running!");
});

export default app;
