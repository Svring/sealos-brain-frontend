import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import QueryConfig from "@/components/configs/query.config";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/auth/auth.provider";
import { CopilotProvider } from "@/contexts/copilot/copilot.provider";
import { EnvProvider } from "@/contexts/env/env.provider";
import { LangGraphProvider } from "@/contexts/langgraph/langgraph.provider";
import { ProjectProvider } from "@/contexts/project/project.provider";
import { ProxyProvider } from "@/contexts/proxy/proxy.provider";

import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "Sealos Brain",
	description: "Sealos Brain",
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
					<NuqsAdapter>
						<EnvProvider>
							<AuthProvider>
								<QueryConfig>
									<ProxyProvider>
										<LangGraphProvider>
											<CopilotProvider>
												<ProjectProvider>
													<SidebarProvider defaultOpen={false}>
														<AppSidebar />
														<SidebarInset>
															<main className="h-full w-full">{children}</main>
														</SidebarInset>
													</SidebarProvider>
												</ProjectProvider>
											</CopilotProvider>
										</LangGraphProvider>
									</ProxyProvider>
								</QueryConfig>
							</AuthProvider>
						</EnvProvider>
					</NuqsAdapter>
				</ThemeProvider>
			</body>
		</html>
	);
}
