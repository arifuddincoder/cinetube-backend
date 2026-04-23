import { escapeHtml } from "../utils/emailHelpers";

export const changeEmailTemplate = ({ newEmail, url }: { newEmail: string; url: string }) => `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Verify New Email - CineTube</title>
</head>
<body style="margin:0;padding:40px 20px;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;">
	<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;">
		<div style="padding:28px 40px 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
			<div style="font-size:26px;font-weight:500;letter-spacing:1px;">
				<span style="color:#1a1a1a;">Cine</span><span style="color:#e50914;">Tube</span>
			</div>
			<div style="margin-top:6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;">Email Change Verification</div>
		</div>

		<div style="padding:32px 40px;">
			<h2 style="font-size:18px;font-weight:500;margin:0 0 8px;">Verify your new email</h2>
			<p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 28px;">
				A request was made to change your CineTube account email to <strong>${escapeHtml(newEmail)}</strong>. Click the button below to confirm this change.
			</p>

			<div style="text-align:center;margin-bottom:24px;">
				<a href="${escapeHtml(url)}" style="display:inline-block;background:#e50914;color:#fff;text-decoration:none;font-size:15px;font-weight:500;padding:14px 36px;border-radius:8px;">
					Verify New Email
				</a>
			</div>

			<p style="font-size:12px;color:#aaa;line-height:1.6;margin-bottom:24px;word-break:break-all;">
				If the button doesn't work, copy and paste this link into your browser:<br />
				<a href="${escapeHtml(url)}" style="color:#e50914;text-decoration:none;">${escapeHtml(url)}</a>
			</p>
		</div>

		<div style="padding:16px 40px;border-top:1px solid #f0f0f0;text-align:center;background:#fafafa;">
			<p style="font-size:12px;color:#bbb;line-height:1.8;margin:0;">&copy; ${new Date().getFullYear()} CineTube. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`;
