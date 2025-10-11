import type React from "react";
import { CopilotAdapter } from "@/contexts/copilot/copilot.adapter";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return <CopilotAdapter>{children}</CopilotAdapter>;
}
