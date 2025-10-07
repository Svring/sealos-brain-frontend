"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, use, useEffect } from "react";
import type { User } from "@/payload-types";
import { proxyMachineContext } from "./proxy.context";
import { proxyMachine } from "./proxy.state";

export function ProxyPayloadAdapter({
	children,
	userPromise,
}: {
	children: ReactNode;
	userPromise: Promise<User | null>;
}) {
	const [state, send] = useMachine(proxyMachine);
	const user = use(userPromise);

	// Handle proxy config updates in useEffect to avoid setState during render
	useEffect(() => {
		if (user) {
			// Read base_url and api_key from user data
			const base_url = user.baseUrl || "";
			const api_key = user.apiKey || "";
			const model_name = "gpt-4.1"; // Default for now

			send({
				type: "SET_CONFIG",
				base_url,
				api_key,
				model_name,
			});
		} else {
			send({ type: "FAIL" });
		}
	}, [user, send]);

	// If no user found, throw error
	if (!user) {
		throw new Error("No user found for proxy configuration");
	}

	return (
		<proxyMachineContext.Provider
			value={{ 
				base_url: state.context.base_url,
				api_key: state.context.api_key,
				model_name: state.context.model_name,
				state, 
				send 
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}

export function ProxyDesktopAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);

	// Desktop adapter is empty for now
	// TODO: Implement desktop-specific logic when needed

	return (
		<proxyMachineContext.Provider
			value={{ 
				base_url: state.context.base_url,
				api_key: state.context.api_key,
				model_name: state.context.model_name,
				state, 
				send 
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}
