"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { LangGraphContext, langgraphMachine } from "./langgraph.state";

interface LangGraphContextValue {
	langgraph: LangGraphContext | null;
	state: StateFrom<typeof langgraphMachine>;
	send: (event: EventFrom<typeof langgraphMachine>) => void;
}

export const langgraphMachineContext = createContext<LangGraphContextValue | undefined>(
	undefined,
);

export function useLangGraphContext() {
	const ctx = use(langgraphMachineContext);
	if (!ctx) {
		throw new Error("useLangGraphContext must be used within LangGraphAdapter");
	}
	return ctx;
}

export function useLangGraphState() {
	const { state } = useLangGraphContext();
	return {
		langgraph: state.context,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useLangGraphEvents() {
	const { send } = useLangGraphContext();

	return {
		setConfig: (base_url: string, api_key: string, model_name: string, agent: string) => 
			send({ type: "SET_CONFIG", base_url, api_key, model_name, agent }),
		setModelName: (model_name: string) => send({ type: "SET_MODEL_NAME", model_name }),
		setAgent: (agent: string) => send({ type: "SET_AGENT", agent }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
