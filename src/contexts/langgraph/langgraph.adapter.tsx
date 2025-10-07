"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, useEffect } from "react";
import { langgraphMachineContext } from "./langgraph.context";
import { langgraphMachine } from "./langgraph.state";

interface LangGraphContext {
	deploymentUrl: string;
	graphId: string;
}

export function LangGraphAdapter({
	children,
	langgraphContext,
}: {
	children: ReactNode;
	langgraphContext: LangGraphContext;
}) {
	const [state, send] = useMachine(langgraphMachine);

	// Handle langgraph config updates in useEffect to avoid setState during render
	useEffect(() => {
		// Set deployment URL and graph ID from environment
		send({
			type: "SET_DEPLOYMENT_URL",
			deploymentUrl: langgraphContext.deploymentUrl,
		});

		send({
			type: "SET_GRAPH_ID",
			graphId: langgraphContext.graphId,
		});

		// Set initial config with empty values - will be populated by user data later
		send({
			type: "SET_CONFIG",
			base_url: "",
			api_key: "",
			model_name: "gpt-4.1",
			region_url: "",
			kubeconfig: "",
		});
	}, [langgraphContext, send]);

	return (
		<langgraphMachineContext.Provider
			value={{ 
				graphState: state.context.graphState,
				deploymentUrl: state.context.deploymentUrl,
				graphId: state.context.graphId,
				state, 
				send 
			}}
		>
			{children}
		</langgraphMachineContext.Provider>
	);
}
