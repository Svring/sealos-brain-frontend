"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { GraphState, langgraphMachine, Message } from "./langgraph.state";

interface LangGraphContextValue {
	graphState: GraphState;
	deploymentUrl: string;
	graphId: string;
	state: StateFrom<typeof langgraphMachine>;
	send: (event: EventFrom<typeof langgraphMachine>) => void;
}

export const langgraphMachineContext = createContext<
	LangGraphContextValue | undefined
>(undefined);

export function useLangGraphContext() {
	const ctx = use(langgraphMachineContext);
	if (!ctx) {
		throw new Error("useLangGraphContext must be used within LangGraphAdapter");
	}
	return ctx;
}

export function useLangGraphState() {
	const { state } = useLangGraphContext();

	// Ensure langgraph is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("LangGraph is still initializing");
	}

	if (state.matches("failed")) {
		throw new Error("LangGraph initialization failed");
	}

	if (!state.context) {
		throw new Error("No LangGraph configuration available");
	}

	// Directly expose the data fields
	return {
		graphState: state.context.graphState,
		deploymentUrl: state.context.deploymentUrl,
		graphId: state.context.graphId,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useLangGraphEvents() {
	const { send } = useLangGraphContext();

	return {
		setConfig: (
			base_url: string,
			api_key: string,
			model_name: string,
			region_url: string,
			kubeconfig: string,
		) =>
			send({
				type: "SET_CONFIG",
				base_url,
				api_key,
				model_name,
				region_url,
				kubeconfig,
			}),
		setDeploymentUrl: (deploymentUrl: string) =>
			send({ type: "SET_DEPLOYMENT_URL", deploymentUrl }),
		setGraphId: (graphId: string) => send({ type: "SET_GRAPH_ID", graphId }),
		updateGraphState: (graphState: Partial<GraphState>) =>
			send({ type: "UPDATE_GRAPH_STATE", graphState }),
		setStage: (stage: GraphState["stage"]) =>
			send({ type: "SET_STAGE", stage }),
		addMessage: (message: Message) => send({ type: "ADD_MESSAGE", message }),
		setProjectContext: (project_context: any) =>
			send({ type: "SET_PROJECT_CONTEXT", project_context }),
		setResourceContext: (resource_context: any) =>
			send({ type: "SET_RESOURCE_CONTEXT", resource_context }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
