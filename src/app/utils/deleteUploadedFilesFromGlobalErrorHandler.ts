import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (urls: string[]) => {
	try {
		if (!urls || urls.length === 0) return;

		await Promise.all(urls.map((url) => deleteFileFromCloudinary(url)));

		console.log(`\nDeleted ${urls.length} uploaded file(s) from Cloudinary due to an error.\n`);
	} catch (error) {
		console.error("Error deleting uploaded files from Global Error Handler", error);
	}
};
