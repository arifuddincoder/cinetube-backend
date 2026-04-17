import PDFDocument from "pdfkit";

interface InvoiceData {
	invoiceId: string;
	userName: string;
	userEmail: string;
	purchaseType: string;
	planType?: string;
	movieTitle?: string;
	amount: number;
	transactionId: string;
	paymentDate: string;
	rentExpiresAt?: string;
	subscriptionEndsAt?: string;
}

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ size: "A4", margin: 50 });
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			// Header
			doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
			doc.moveDown(0.5);
			doc.fontSize(10).font("Helvetica").text("CineTube Premium", { align: "center" });
			doc.text("Your Entertainment, Our Priority", { align: "center" });
			doc.moveDown(1);

			// Divider
			doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
			doc.moveDown(1);

			// Invoice Info
			doc.fontSize(11).font("Helvetica-Bold").text("Invoice Information");
			doc
				.fontSize(10)
				.font("Helvetica")
				.text(`Invoice ID: ${data.invoiceId}`)
				.text(`Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}`)
				.text(`Transaction ID: ${data.transactionId}`);
			doc.moveDown(0.8);

			// User Info
			doc.fontSize(11).font("Helvetica-Bold").text("Customer Information");
			doc.fontSize(10).font("Helvetica").text(`Name: ${data.userName}`).text(`Email: ${data.userEmail}`);
			doc.moveDown(0.8);

			// Purchase Info
			doc.fontSize(11).font("Helvetica-Bold").text("Purchase Details");
			doc.fontSize(10).font("Helvetica").text(`Purchase Type: ${data.purchaseType}`);

			if (data.planType) {
				doc.text(`Plan: ${data.planType}`);
			}
			if (data.movieTitle) {
				doc.text(`Movie: ${data.movieTitle}`);
			}
			if (data.rentExpiresAt) {
				doc.text(`Rental Expires: ${new Date(data.rentExpiresAt).toLocaleDateString()}`);
			}
			if (data.subscriptionEndsAt) {
				doc.text(`Subscription Ends: ${new Date(data.subscriptionEndsAt).toLocaleDateString()}`);
			}

			doc.moveDown(1);
			doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
			doc.moveDown(1);

			// Payment Summary
			doc.fontSize(11).font("Helvetica-Bold").text("Payment Summary");
			doc.moveDown(0.5);

			const col1X = 50;
			const col2X = 450;

			doc.fontSize(10).font("Helvetica-Bold");
			doc.text("Description", col1X, doc.y);
			doc.text("Amount", col2X, doc.y - 12, { align: "right" });
			doc
				.moveTo(col1X, doc.y)
				.lineTo(col2X + 80, doc.y)
				.stroke();
			doc.moveDown(0.5);

			const amountY = doc.y;
			doc.fontSize(10).font("Helvetica");
			doc.text(data.purchaseType, col1X, amountY);
			doc.text(`${data.amount.toFixed(2)} BDT`, col2X, amountY, { align: "right" });
			doc.moveDown(0.8);

			const totalY = doc.y;
			doc.fontSize(11).font("Helvetica-Bold");
			doc.text("Total Amount", col1X, totalY);
			doc.text(`${data.amount.toFixed(2)} BDT`, col2X, totalY, { align: "right" });
			doc
				.moveTo(col1X, doc.y)
				.lineTo(col2X + 80, doc.y)
				.stroke();
			doc.moveDown(1.5);

			// Footer
			doc
				.fontSize(9)
				.font("Helvetica")
				.text("Thank you for choosing CineTube. This is an electronically generated invoice.", { align: "center" })
				.text("If you have any questions, please contact us at support@cinetube.com", { align: "center" })
				.text("Payment processed securely through Stripe", { align: "center" });

			doc.end();
		} catch (error) {
			reject(error);
		}
	});
};
