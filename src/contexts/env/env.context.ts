"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { EnvContext, envMachine } from "./env.state";

interface EnvContextValue {
	env: EnvContext;
	state: StateFrom<typeof envMachine>;
	send: (event: EventFrom<typeof envMachine>) => void;
}

export const envMachineContext = createContext<EnvContextValue | undefined>(
	undefined,
);

export function useEnvContext() {
	const ctx = use(envMachineContext);
	if (!ctx) {
		throw new Error("useEnvContext must be used within EnvAdapter");
	}
	return ctx;
}

export function useEnvState() {
	const { state } = useEnvContext();
	return {
		mode: state.context.mode,
		variables: state.context.variables,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useEnvEvents() {
	const { send } = useEnvContext();

	return {
		setEnv: (
			mode: "development" | "production",
			variables: Record<string, string | undefined>,
		) => send({ type: "SET_ENV", mode, variables }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
