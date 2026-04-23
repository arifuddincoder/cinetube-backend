import { changeEmailTemplate } from "../templates/changeEmailTemplate";
import { forgotPasswordTemplate } from "../templates/forgotPasswordTemplate";
import { invoiceTemplate } from "../templates/invoiceTemplate";
import { otpTemplate } from "../templates/otpTemplate";
import { EmailTemplateName } from "./emailHelpers";

export const getEmailTemplate = (templateName: EmailTemplateName, data: Record<string, any>) => {
	switch (templateName) {
		case "change-email":
			return changeEmailTemplate(data);
		case "otp":
			return otpTemplate(data);
		case "forgot-password":
			return forgotPasswordTemplate(data);
		case "invoice":
			return invoiceTemplate(data);
		default:
			throw new Error(`Unknown email template: ${templateName}`);
	}
};
