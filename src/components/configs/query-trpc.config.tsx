"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import type { AiProxyRouter } from "@/trpc/ai-proxy.trpc";
import type { K8sRouter } from "@/trpc/k8s.trpc";

export const k8sClient = createTRPCContext<K8sRouter>();
export const aiProxyClient = createTRPCContext<AiProxyRouter>();

interface TRPCConfigProps {
	children: React.ReactNode;
	queryClient: QueryClient;
}

export default function TRPCConfig({ children, queryClient }: TRPCConfigProps) {
	// For now, we'll use a mock auth object since auth context isn't set up yet
	// This should be replaced with actual auth context when available
	const mockAuth = {
		kubeconfig: "mock-kubeconfig",
		appToken: "mock-app-token",
	};

	const [k8sTrpcClient] = useState(() =>
		createTRPCClient<K8sRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/k8s",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfig: mockAuth.kubeconfig,
					}),
				}),
			],
		}),
	);

	const [aiProxyTrpcClient] = useState(() =>
		createTRPCClient<AiProxyRouter>({
			links: [
				httpBatchLink({
					url: "/api/trpc/ai-proxy",
					maxURLLength: 6000,
					headers: () => ({
						kubeconfig: mockAuth.kubeconfig,
						appToken: mockAuth.appToken || "",
					}),
				}),
			],
		}),
	);

	return (
		<k8sClient.TRPCProvider
			trpcClient={k8sTrpcClient}
			queryClient={queryClient}
		>
			<aiProxyClient.TRPCProvider
				trpcClient={aiProxyTrpcClient}
				queryClient={queryClient}
			>
				{children}
			</aiProxyClient.TRPCProvider>
		</k8sClient.TRPCProvider>
	);
}
