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
			const doc = new PDFDocument({ size: "A4", margin: 0 });
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);

			const pageWidth = 595.28;
			const pageHeight = 841.89;
			const margin = 50;
			const contentWidth = pageWidth - margin * 2;

			// Background
			doc.rect(0, 0, pageWidth, pageHeight).fill("#f8f8f8");

			// Header Bar
			doc.rect(0, 0, pageWidth, 110).fill("#1a1a1a");

			// Logo — Cine white, Tube red
			doc.fontSize(26).font("Helvetica-Bold").fillColor("#ffffff").text("Cine", margin, 40, { continued: true });
			doc.fillColor("#e50914").text("Tube");

			// INVOICE label — white, right aligned
			doc.fontSize(12).font("Helvetica").fillColor("#aaaaaa").text("INVOICE", margin, 46, {
				width: contentWidth,
				align: "right",
			});

			// White Card
			doc.roundedRect(margin - 10, 128, contentWidth + 20, pageHeight - 168, 8).fill("#ffffff");

			let y = 158;

			// Invoice Meta Row
			doc.fontSize(9).font("Helvetica").fillColor("#aaaaaa").text("INVOICE ID", margin, y);
			doc
				.fontSize(9)
				.font("Helvetica")
				.fillColor("#aaaaaa")
				.text("DATE", 0, y, {
					width: pageWidth - margin,
					align: "right",
				});
			y += 14;

			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.fillColor("#1a1a1a")
				.text(data.invoiceId, margin, y, { width: contentWidth / 2 });
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.fillColor("#1a1a1a")
				.text(
					new Date(data.paymentDate).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					0,
					y,
					{ width: pageWidth - margin, align: "right" },
				);

			y += 40;

			// Divider
			doc.rect(margin, y, contentWidth, 0.5).fill("#eeeeee");
			y += 20;

			// Billed To — Left
			doc.fontSize(8).font("Helvetica").fillColor("#aaaaaa").text("BILLED TO", margin, y);
			y += 14;
			doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a1a").text(data.userName, margin, y);
			y += 16;
			doc.fontSize(9).font("Helvetica").fillColor("#666666").text(data.userEmail, margin, y);

			// Transaction — Right (same y level as BILLED TO section)
			const txY = y - 46;
			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#aaaaaa")
				.text("TRANSACTION ID", 0, txY, { width: pageWidth - margin, align: "right" });

			// truncate transaction id if too long
			const txId = data.transactionId.length > 30 ? data.transactionId.substring(0, 30) + "..." : data.transactionId;
			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#444444")
				.text(txId, 0, txY + 13, { width: pageWidth - margin, align: "right" });

			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#aaaaaa")
				.text("PAYMENT METHOD", 0, txY + 30, { width: pageWidth - margin, align: "right" });
			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#444444")
				.text("Stripe — Card", 0, txY + 43, { width: pageWidth - margin, align: "right" });

			y += 30;

			// Divider
			doc.rect(margin, y, contentWidth, 0.5).fill("#eeeeee");
			y += 20;

			// Table Header
			doc.rect(margin, y, contentWidth, 30).fill("#f5f5f5");
			doc
				.fontSize(8)
				.font("Helvetica-Bold")
				.fillColor("#888888")
				.text("DESCRIPTION", margin + 12, y + 10);
			doc
				.fontSize(8)
				.font("Helvetica-Bold")
				.fillColor("#888888")
				.text("AMOUNT", 0, y + 10, { width: pageWidth - margin - 12, align: "right" });
			y += 40;

			// Table Rows
			const addRow = (label: string, value: string, isAmount = false) => {
				doc
					.fontSize(10)
					.font("Helvetica")
					.fillColor("#333333")
					.text(label, margin + 12, y, { width: contentWidth / 2 });
				doc
					.fontSize(10)
					.font(isAmount ? "Helvetica-Bold" : "Helvetica")
					.fillColor("#1a1a1a")
					.text(value, 0, y, { width: pageWidth - margin - 12, align: "right" });
				y += 30;
				doc.rect(margin, y, contentWidth, 0.5).fill("#f0f0f0");
				y += 10;
			};

			const purchaseLabel =
				data.purchaseType === "SUBSCRIPTION"
					? `Premium Subscription — ${data.planType}`
					: data.purchaseType === "RENT"
						? `Movie Rental — ${data.movieTitle}`
						: `Movie Purchase — ${data.movieTitle}`;

			addRow(purchaseLabel, `${data.amount.toFixed(2)} BDT`, true);

			if (data.rentExpiresAt) {
				addRow(
					"Rental Expires",
					new Date(data.rentExpiresAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				);
			}

			if (data.subscriptionEndsAt) {
				addRow(
					"Subscription Valid Until",
					new Date(data.subscriptionEndsAt).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				);
			}

			y += 16;

			// Total Bar
			doc.rect(margin, y, contentWidth, 52).fill("#1a1a1a");
			doc
				.fontSize(10)
				.font("Helvetica")
				.fillColor("#aaaaaa")
				.text("TOTAL AMOUNT", margin + 16, y + 18);
			doc
				.fontSize(16)
				.font("Helvetica-Bold")
				.fillColor("#ffffff")
				.text(`${data.amount.toFixed(2)} BDT`, 0, y + 16, {
					width: pageWidth - margin - 16,
					align: "right",
				});
			y += 70;

			// PAID Badge
			doc.rect(margin, y, 64, 22).fill("#f0fdf4");
			doc.rect(margin, y, 64, 22).strokeColor("#bbf7d0").lineWidth(0.5).stroke();
			doc
				.fontSize(8)
				.font("Helvetica-Bold")
				.fillColor("#16a34a")
				.text("✓ PAID", margin + 10, y + 7);
			y += 44;

			// Footer Divider
			doc.rect(margin, y, contentWidth, 0.5).fill("#eeeeee");
			y += 20;

			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#bbbbbb")
				.text("Thank you for choosing CineTube. This is an electronically generated invoice.", margin, y, {
					align: "center",
					width: contentWidth,
				});
			doc
				.fontSize(8)
				.font("Helvetica")
				.fillColor("#bbbbbb")
				.text("For questions, contact support@cinetube.com", margin, y + 14, {
					align: "center",
					width: contentWidth,
				});

			doc.end();
		} catch (error) {
			reject(error);
		}
	});
};
