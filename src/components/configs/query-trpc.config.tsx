"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import type { K8sRouter } from "@/trpc/k8s.trpc";

export const k8sClient = createTRPCContext<K8sRouter>();

// Raw TRPC client for direct API calls
export const createRawK8sClient = (auth: any) =>
	createTRPCClient<K8sRouter>({
		links: [
			httpBatchLink({
				url: "/api/trpc/k8s",
				maxURLLength: 6000,
				headers: () => ({
					kubeconfig: auth.kubeconfig,
				}),
			}),
		],
	});

interface TRPCConfigProps {
	children: React.ReactNode;
	queryClient: QueryClient;
}

export default function TRPCConfig({
	children,
	queryClient,
}: TRPCConfigProps) {
	// For now, we'll use a mock auth object since auth context isn't set up yet
	// This should be replaced with actual auth context when available
	const mockAuth = {
		kubeconfig: "mock-kubeconfig",
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

	return (
		<k8sClient.TRPCProvider
			trpcClient={k8sTrpcClient}
			queryClient={queryClient}
		>
			{children}
		</k8sClient.TRPCProvider>
	);
}
