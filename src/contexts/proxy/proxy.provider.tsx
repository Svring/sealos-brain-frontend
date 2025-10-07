import type React from "react";
import { getUser } from "@/payload/operations/users-operation";
import { ProxyDesktopAdapter, ProxyPayloadAdapter } from "./proxy.adapter";

interface ProxyProviderProps {
	children: React.ReactNode;
}

export function ProxyProvider({ children }: ProxyProviderProps) {
	// Read environment variables (server-side)
	const mode =
		(process.env.MODE as "development" | "production") || "production";

	// Only render ProxyPayloadAdapter in development mode
	if (mode === "development") {
		// Create the promise that will be resolved by the adapter
		const userPromise = getUser();
		return (
			<ProxyPayloadAdapter userPromise={userPromise}>
				{children}
			</ProxyPayloadAdapter>
		);
	}

	// In production mode, render ProxyDesktopAdapter
	return <ProxyDesktopAdapter>{children}</ProxyDesktopAdapter>;
}
