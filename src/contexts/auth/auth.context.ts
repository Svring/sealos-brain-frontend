"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Auth, authMachine } from "./auth.state";

interface AuthContextValue {
	auth: Auth | null;
	state: StateFrom<typeof authMachine>;
	send: (event: EventFrom<typeof authMachine>) => void;
}

export const authMachineContext = createContext<AuthContextValue | undefined>(
	undefined,
);

export function useAuthContext() {
	const ctx = use(authMachineContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within AuthAdapter");
	}
	return ctx;
}

export function useAuthState() {
	const { state } = useAuthContext();
	return {
		auth: state.context.auth,
		isInitializing: state.matches("initializing"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useAuthEvents() {
	const { send } = useAuthContext();

	return {
		setAuth: (auth: Auth) => send({ type: "SET_AUTH", auth }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
