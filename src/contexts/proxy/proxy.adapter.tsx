"use client";

import { useMachine } from "@xstate/react";
import { type ReactNode, useEffect } from "react";
import { useProxyToken } from "@/hooks/ai-proxy/use-proxy-token";
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
					base_url: composeAiProxyChatUrl(auth.regionUrl),
					api_key: firstToken.key,
					model_name: "gpt-4.1",
				});
			}
		}
	}, [data, send, auth?.regionUrl]);

	return (
		<proxyMachineContext.Provider
			value={{
				base_url: state.context.base_url,
				api_key: state.context.api_key,
				model_name: state.context.model_name,
				state,
				send,
			}}
		>
			{children}
		</proxyMachineContext.Provider>
	);
}
