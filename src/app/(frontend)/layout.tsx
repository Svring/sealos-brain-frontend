import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type React from "react";
import QueryConfig from "@/components/configs/query.config";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/auth/auth.provider";
import { EnvProvider } from "@/contexts/env/env.provider";
import { ProxyProvider } from "@/contexts/proxy/proxy.provider";

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
						<AuthProvider>
							<ProxyProvider>
								<QueryConfig>
									<SidebarProvider defaultOpen={false}>
										<AppSidebar />
										<SidebarInset>
											<main>
												<SidebarTrigger />
												{children}
											</main>
										</SidebarInset>
									</SidebarProvider>
								</QueryConfig>
							</ProxyProvider>
						</AuthProvider>
					</EnvProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
