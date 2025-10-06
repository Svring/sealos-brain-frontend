"use client";

import { useMount } from "@reactuses/core";
import { useMachine } from "@xstate/react";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { ChevronRight, User as UserIcon } from "lucide-react";
import { createContext, type ReactNode, use, useEffect } from "react";
import type { EventFrom, StateFrom } from "xstate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { loginUser } from "@/payload/operations/users-operation";
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
	usersPromise,
}: {
	children: ReactNode;
	userPromise: Promise<User | null>;
	usersPromise: Promise<User[]>;
}) {
	const [state, send] = useMachine(authMachine);
	const users = use(usersPromise);
	const user = use(userPromise);

	// console.log('user', user)

	// Handle auth state updates in useEffect to avoid setState during render
	useEffect(() => {
		if (user) {
			send({
				type: "SET_AUTH",
				auth: {
					kubeconfig: user.kubeconfig,
					appToken: user.appToken || "",
				},
			});
		} else {
			send({ type: "FAIL" });
		}
	}, [user, send]);

	// console.log("users", users);

	const handleUserSelect = async (selectedUser: User) => {
		try {
			const result = await loginUser(selectedUser.username, "123");
			if (result.success && result.user) {
				send({
					type: "SET_AUTH",
					auth: {
						kubeconfig: result.user.kubeconfig,
						appToken: result.user.appToken || "",
					},
				});
				// Refresh the page after successful login
				window.location.reload();
			} else {
				console.error("Login failed:", result.error);
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	// If no user found, show user selection
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="w-full max-w-sm space-y-3">
					<h2 className="text-center text-lg font-semibold">Select User</h2>
					<ItemGroup>
						{users.map((u) => (
							<Item
								size="sm"
								key={u.id}
								className="cursor-pointer hover:bg-muted"
								onClick={() => handleUserSelect(u)}
							>
								<ItemContent className="flex flex-row items-center gap-3 ">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={u.avatar?.url || ""}
											alt={u.username || u.email || `User ${u.id}`}
										/>
										<AvatarFallback className="text-xs">
											<UserIcon className="h-4 w-4" />
										</AvatarFallback>
									</Avatar>
									<ItemTitle className="flex-1 text-sm">
										{u.username || u.email || `User ${u.id}`}
									</ItemTitle>
									<ChevronRight className="h-4 w-4 text-muted-foreground" />
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
