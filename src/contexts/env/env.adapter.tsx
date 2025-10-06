"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import { type EnvContext, envMachine } from "./env.state";

interface EnvContextValue {
	env: EnvContext;
	state: StateFrom<typeof envMachine>;
	send: (event: EventFrom<typeof envMachine>) => void;
}

const envMachineContext = createContext<EnvContextValue | undefined>(undefined);

interface EnvAdapterProps {
	children: ReactNode;
	envContext: EnvContext;
}

export function EnvAdapter({ children, envContext }: EnvAdapterProps) {
	const [state, send] = useMachine(envMachine, {
		input: envContext,
	});

  console.log('envContext', envContext)

	return (
		<envMachineContext.Provider
			value={{
				env: state.context,
				state,
				send,
			}}
		>
			{children}
		</envMachineContext.Provider>
	);
}

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
