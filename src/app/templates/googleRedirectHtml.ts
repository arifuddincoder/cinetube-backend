export const googleRedirectHtml = (betterAuthUrl: string, callbackURL: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>Redirecting - CineTube</title>
</head>
<body>
	<p>Redirecting to Google...</p>
	<script>
		window.onload = function () {
			fetch("${betterAuthUrl}/api/auth/sign-in/social", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					provider: "google",
					callbackURL: "${callbackURL}",
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.url) window.location.href = data.url;
				})
				.catch(() => {
					window.location.href = "${betterAuthUrl}/api/v1/auth/google/error";
				});
		};
	</script>
</body>
</html>
`;
