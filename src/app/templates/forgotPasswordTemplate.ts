import { escapeHtml } from "../utils/emailHelpers";

export const forgotPasswordTemplate = ({ name, otp }: { name: string; otp: string }) => `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Password Reset - CineTube</title>
</head>
<body style="margin:0;padding:40px 20px;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;">
	<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e0e0e0;">
		<div style="padding:28px 40px 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
			<div style="font-size:26px;font-weight:500;letter-spacing:1px;">
				<span style="color:#1a1a1a;">Cine</span><span style="color:#e50914;">Tube</span>
			</div>
			<div style="margin-top:6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;">Password Reset</div>
		</div>

		<div style="padding:32px 40px;">
			<h2 style="font-size:18px;font-weight:500;margin:0 0 8px;">Hey ${escapeHtml(name)}, reset your password</h2>
			<p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 28px;">
				We received a request to reset your CineTube account password. Use the one-time password below to proceed.
			</p>

			<div style="background:#fafafa;border:1px solid #e8e8e8;border-radius:12px;text-align:center;padding:24px 20px;margin-bottom:24px;">
				<div style="font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#aaa;font-weight:500;margin-bottom:16px;">Password reset OTP</div>
				<div style="display:inline-block;background:#fff;border:1px solid #e0e0e0;border-radius:8px;font-size:32px;font-weight:500;color:#e50914;text-align:center;padding:14px 32px;letter-spacing:12px;">
					${escapeHtml(otp)}
				</div>
				<div style="font-size:13px;color:#999;margin-top:16px;">Expires in <span style="color:#1a1a1a;font-weight:500;">2 minutes</span></div>
			</div>
		</div>

		<div style="padding:16px 40px;border-top:1px solid #f0f0f0;text-align:center;background:#fafafa;">
			<p style="font-size:12px;color:#bbb;line-height:1.8;margin:0;">&copy; ${new Date().getFullYear()} CineTube. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
`;
