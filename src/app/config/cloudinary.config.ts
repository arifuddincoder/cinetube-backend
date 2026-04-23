import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { envVars } from "./env";

cloudinary.config({
	cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
	api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
	api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse> => {
	if (!buffer || !fileName) {
		throw new AppError(status.BAD_REQUEST, "File buffer and file name are required for upload");
	}

	const extension = fileName.split(".").pop()?.toLowerCase();
	const isPdf = extension === "pdf";

	const fileNameWithoutExtension = fileName
		.split(".")
		.slice(0, -1)
		.join(".")
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");

	const uniqueName = `${Math.random().toString(36).slice(2)}-${Date.now()}-${fileNameWithoutExtension}`;
	const publicId = `cinetube/${isPdf ? "pdfs" : "images"}/${uniqueName}`;

	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					resource_type: isPdf ? "raw" : "image",
					public_id: publicId,
				},
				(error, result) => {
					if (error || !result) {
						return reject(new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"));
					}
					resolve(result);
				},
			)
			.end(buffer);
	});
};

export const deleteFileFromCloudinary = async (url: string) => {
	try {
		const regex = /\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
		const match = url.match(regex);

		if (!match?.[1]) {
			throw new AppError(status.BAD_REQUEST, "Invalid Cloudinary URL");
		}

		const publicId = match[1];
		const isPdf = url.includes("/raw/upload/");

		await cloudinary.uploader.destroy(publicId, {
			resource_type: isPdf ? "raw" : "image",
		});
	} catch {
		throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
	}
};

export const cloudinaryUpload = cloudinary;
