import app from "./app";

const bootstrap = () => {
	try {
		app.listen(5000, () => {
			console.log(`Server is running on http://localhost:5000`);
		});
	} catch (error) {
		console.error("Failed to load server", error);
	}
};

bootstrap();
