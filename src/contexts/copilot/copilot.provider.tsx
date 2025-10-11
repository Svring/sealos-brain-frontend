import type React from "react";
import { checkGraphStatus } from "@/lib/langgraph/langgraph.utils";

interface CopilotProviderProps {
	children: React.ReactNode;
}

export async function CopilotProvider({ children }: CopilotProviderProps) {
	const LANGGRAPH_DEPLOYMENT_URL = process.env.LANGGRAPH_DEPLOYMENT_URL;

	// Check status server-side
	if (LANGGRAPH_DEPLOYMENT_URL) {
		const isHealthy = await checkGraphStatus(LANGGRAPH_DEPLOYMENT_URL);
		if (!isHealthy) {
			console.warn(
				`LangGraph server is not healthy at ${LANGGRAPH_DEPLOYMENT_URL}`,
			);
		}
	}

	return <>{children}</>;
}
