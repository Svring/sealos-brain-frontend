"use client";

import { useMount } from "@reactuses/core";
import { useMachine } from "@xstate/react";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { createContext, type ReactNode, use, useState } from "react";
import type { EventFrom, StateFrom } from "xstate";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { getAllUsers } from "@/payload/operations/users-operation";
import type { User } from "@/payload-types";
import { type Auth, authMachine } from "./auth.state";

interface AuthContextValue {
	auth: Auth | null;
	state: StateFrom<typeof authMachine>;
	send: (event: EventFrom<typeof authMachine>) => void;
}

const authMachineContext = createContext<AuthContextValue | undefined>(
	undefined,
);

export function AuthPayloadAdapter({
	children,
	userPromise,
}: {
	children: ReactNode;
	userPromise: Promise<User | null>;
}) {
	const [state, send] = useMachine(authMachine);
	const [users, setUsers] = useState<User[]>([]);
	const user = use(userPromise);

	// console.log('user', user)

	if (user) {
		send({
			type: "SET_AUTH",
			auth: {
				kubeconfig: user.kubeconfig,
				appToken: user.appToken || "",
			},
		});
	} else {
		// Load all users when no user is found
		if (users.length === 0) {
			getAllUsers().then(setUsers);
		}
		send({ type: "FAIL" });
	}

	// If no user found, show user selection
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-md space-y-4">
					<h2 className="text-center text-xl font-semibold">Select User</h2>
					<ItemGroup>
						{users.map((u) => (
							<Item key={u.id} className="cursor-pointer hover:bg-muted">
								<ItemContent>
									<ItemTitle>
										{u.username || u.email || `User ${u.id}`}
									</ItemTitle>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</div>
			</div>
		);
	}

	return (
		<authMachineContext.Provider
			value={{ auth: state.context.auth, state, send }}
		>
			{children}
		</authMachineContext.Provider>
	);
}

export function AuthDesktopAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(authMachine);

	// Get session data on mount
	useMount(async () => {
		createSealosApp();
		const sessionData = await sealosApp.getSession();

		if (sessionData?.kubeconfig) {
			const auth: Auth = {
				kubeconfig: sessionData.kubeconfig,
				appToken: sessionData.token || "",
			};
			send({ type: "SET_AUTH", auth });
		} else {
			send({ type: "FAIL" });
		}
	});

	return (
		<authMachineContext.Provider
			value={{ auth: state.context.auth, state, send }}
		>
			{children}
		</authMachineContext.Provider>
	);
}

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
