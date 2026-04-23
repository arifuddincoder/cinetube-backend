import { escapeHtml } from "../utils/emailHelpers";

export const invoiceTemplate = ({
	userName,
	invoiceId,
	paymentDate,
	transactionId,
	purchaseType,
	planType,
	movieTitle,
	amount,
	invoiceUrl,
	subscriptionEndsAt,
	rentExpiresAt,
}: {
	userName: string;
	invoiceId: string;
	paymentDate: string;
	transactionId: string;
	purchaseType: "SUBSCRIPTION" | "RENT" | "BUY";
	planType?: string;
	movieTitle?: string;
	amount: number;
	invoiceUrl?: string;
	subscriptionEndsAt?: string;
	rentExpiresAt?: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
	<title>Invoice - CineTube</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e0e0e0;overflow:hidden;">

<tr>
<td style="padding:28px 40px 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
<p style="font-size:26px;margin:0;">
<span style="color:#1a1a1a;">Cine</span><span style="color:#e50914;">Tube</span>
</p>
<p style="font-size:11px;color:#999;margin-top:6px;letter-spacing:3px;text-transform:uppercase;">Payment Invoice</p>
</td>
</tr>

<tr>
<td style="padding:28px 40px;">
<p style="margin:0 0 8px;">Hey ${escapeHtml(userName)},</p>
<p style="margin:0 0 20px;color:#666;">
Your payment was successful. Here are your invoice details:
</p>

<p><strong>Invoice ID:</strong> ${escapeHtml(invoiceId)}</p>
<p><strong>Date:</strong> ${escapeHtml(paymentDate)}</p>
<p><strong>Transaction:</strong> ${escapeHtml(transactionId)}</p>
<p><strong>Type:</strong> ${escapeHtml(purchaseType)}</p>

${planType ? `<p><strong>Plan:</strong> ${escapeHtml(planType)}</p>` : ""}
${movieTitle ? `<p><strong>Movie:</strong> ${escapeHtml(movieTitle)}</p>` : ""}

<p style="font-size:18px;margin-top:10px;">
<strong>Total:</strong> ৳${amount.toFixed(2)}
</p>

${
	invoiceUrl
		? `<p style="margin-top:20px;">
<a href="${escapeHtml(invoiceUrl)}" style="background:#e50914;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
Download Invoice
</a></p>`
		: ""
}

${
	purchaseType === "SUBSCRIPTION" && subscriptionEndsAt
		? `<p style="margin-top:20px;color:#7a6010;">
Subscription valid until <strong>${escapeHtml(subscriptionEndsAt)}</strong>
</p>`
		: ""
}

${
	purchaseType === "RENT" && rentExpiresAt
		? `<p style="margin-top:20px;color:#7a6010;">
Rental expires on <strong>${escapeHtml(rentExpiresAt)}</strong>
</p>`
		: ""
}

${
	purchaseType === "BUY"
		? `<p style="margin-top:20px;color:#7a6010;">
You have lifetime access to this movie.
</p>`
		: ""
}

<p style="margin-top:20px;font-size:12px;color:#aaa;">
If you did not make this purchase, contact support immediately.
</p>

</td>
</tr>

<tr>
<td style="padding:16px 40px;text-align:center;border-top:1px solid #eee;background:#fafafa;">
<p style="font-size:12px;color:#bbb;margin:0;">
© ${new Date().getFullYear()} CineTube
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
