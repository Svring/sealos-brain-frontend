"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { proxyMachine } from "./proxy.state";

interface ProxyContextValue {
	base_url: string;
	api_key: string;
	model_name: string;
	state: StateFrom<typeof proxyMachine>;
	send: (event: EventFrom<typeof proxyMachine>) => void;
}

export const proxyMachineContext = createContext<ProxyContextValue | undefined>(
	undefined,
);

export function useProxyContext() {
	const ctx = use(proxyMachineContext);
	if (!ctx) {
		throw new Error("useProxyContext must be used within ProxyAdapter");
	}
	return ctx;
}

export function useProxyState() {
	const { state } = useProxyContext();
	
	// Ensure proxy is ready, throw error if not
	if (state.matches("initializing")) {
		throw new Error("Proxy is still initializing");
	}
	
	if (state.matches("failed")) {
		throw new Error("Proxy initialization failed");
	}
	
	if (!state.context) {
		throw new Error("No proxy configuration available");
	}
	
	// Directly expose the three data fields
	return {
		base_url: state.context.base_url,
		api_key: state.context.api_key,
		model_name: state.context.model_name,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useProxyEvents() {
	const { send } = useProxyContext();

	return {
		setConfig: (base_url: string, api_key: string, model_name: string) => 
			send({ type: "SET_CONFIG", base_url, api_key, model_name }),
		setModelName: (model_name: string) => send({ type: "SET_MODEL_NAME", model_name }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
