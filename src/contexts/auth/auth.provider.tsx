"use client";

import { useMachine } from "@xstate/react";
import { createContext, type ReactNode, use } from "react";
import type { ActorRefFrom, EventFrom, StateFrom } from "xstate";
import { type Auth, type AuthContext, type AuthEvent, authMachine } from "./auth.state";

interface AuthContextValue {
	auth: Auth | null;
	state: StateFrom<typeof authMachine>;
	send: (event: EventFrom<typeof authMachine>) => void;
	actorRef: ActorRefFrom<typeof authMachine>;
}

const authMachineContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [state, send, actorRef] = useMachine(authMachine);

	return (
		<authMachineContext.Provider
			value={{
				auth: state.context.auth,
				state,
				send,
				actorRef,
			}}
		>
			{children}
		</authMachineContext.Provider>
	);
};

export function useAuthContext() {
	const ctx = use(authMachineContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within AuthProvider");
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
