import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type React from "react";
import { AuthProvider } from "@/contexts/auth/auth.provider";
import { EnvProvider } from "@/contexts/env/env.provider";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Sealos Brain",
	description: "Sealos Brain",
	generator: "v0.dev",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<EnvProvider>
						<AuthProvider>{children}</AuthProvider>
					</EnvProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
