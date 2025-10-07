import type React from "react";
import { getUser } from "@/payload/operations/users-operation";
import { LangGraphDesktopAdapter, LangGraphPayloadAdapter } from "./langgraph.adapter";

interface LangGraphProviderProps {
	children: React.ReactNode;
}

export function LangGraphProvider({ children }: LangGraphProviderProps) {
	// Read environment variables (server-side)
	const mode =
		(process.env.MODE as "development" | "production") || "production";

	// Only render LangGraphPayloadAdapter in development mode
	if (mode === "development") {
		// Create the promise that will be resolved by the adapter
		const userPromise = getUser();
		return (
			<LangGraphPayloadAdapter userPromise={userPromise}>
				{children}
			</LangGraphPayloadAdapter>
		);
	}

	// In production mode, render LangGraphDesktopAdapter
	return <LangGraphDesktopAdapter>{children}</LangGraphDesktopAdapter>;
}
