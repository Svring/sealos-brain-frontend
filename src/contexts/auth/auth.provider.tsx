import type React from "react";
import { getUser } from "@/payload/operations/users-operation";
import { AuthDesktopAdapter, AuthPayloadAdapter } from "./auth.adapter";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Read environment variables (server-side)
	const mode =
		(process.env.MODE as "development" | "production") || "production";

	// Only render AuthPayloadAdapter in development mode
	if (mode === "development") {
		// Create the promise that will be resolved by the adapter
		const userPromise = getUser();
		return (
			<AuthPayloadAdapter userPromise={userPromise}>
				{children}
			</AuthPayloadAdapter>
		);
	}

	// In production mode, render AuthDesktopAdapter
	return <AuthDesktopAdapter>{children}</AuthDesktopAdapter>;
}
