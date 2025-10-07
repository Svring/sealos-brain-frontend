"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, use, useEffect } from "react";
import type { User } from "@/payload-types";
import { langgraphMachineContext } from "./langgraph.context";
import { langgraphMachine } from "./langgraph.state";

export function LangGraphPayloadAdapter({
	children,
	userPromise,
}: {
	children: ReactNode;
	userPromise: Promise<User | null>;
}) {
	const [state, send] = useMachine(langgraphMachine);
	const user = use(userPromise);

	// Handle langgraph config updates in useEffect to avoid setState during render
	useEffect(() => {
		if (user) {
			// Read base_url and api_key from user data
			const base_url = user.baseUrl || "";
			const api_key = user.apiKey || "";
			const model_name = "gpt-4"; // Default for now
			const agent = "orca"; // Default for now

			send({
				type: "SET_CONFIG",
				base_url,
				api_key,
				model_name,
				agent,
			});
		} else {
			send({ type: "FAIL" });
		}
	}, [user, send]);

	// If no user found, show user selection
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-sm space-y-3">
					<h2 className="text-center text-lg font-semibold">
						Select User for LangGraph
					</h2>
					<div className="text-center text-sm text-muted-foreground">
						Please select a user to configure LangGraph settings
					</div>
				</div>
			</div>
		);
	}

	return (
		<langgraphMachineContext.Provider
			value={{ langgraph: state.context, state, send }}
		>
			{children}
		</langgraphMachineContext.Provider>
	);
}

export function LangGraphDesktopAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(langgraphMachine);

	// Desktop adapter is empty for now
	// TODO: Implement desktop-specific logic when needed

	return (
		<langgraphMachineContext.Provider
			value={{ langgraph: state.context, state, send }}
		>
			{children}
		</langgraphMachineContext.Provider>
	);
}
