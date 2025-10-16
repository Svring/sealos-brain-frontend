"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, useEffect } from "react";
import { useProxyToken } from "@/hooks/sealos/ai-proxy/use-proxy-token";
import { composeAiProxyChatUrl } from "@/lib/sealos/ai-proxy/ai-proxy-utils";
import { useAuthState } from "../auth/auth.context";
import { proxyMachineContext } from "./proxy.context";
import { proxyMachine } from "./proxy.state";

export function ProxyAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(proxyMachine);
	const { auth } = useAuthState();

	const { data } = useProxyToken();

	useEffect(() => {
		if (data && data.length > 0) {
			const firstToken = data[0];
			if (firstToken && auth?.regionUrl) {
				send({
					type: "SET_CONFIG",
					baseURL: composeAiProxyChatUrl(auth.regionUrl),
					apiKey: firstToken.key,
					modelName: "gpt-4.1",
				});
			}
		}
	}, [data, send, auth?.regionUrl]);

	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<proxyMachineContext.Provider
			value={{
				baseURL: state.context.baseURL,
				apiKey: state.context.apiKey,
				modelName: state.context.modelName,
				state,
				send,
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}
