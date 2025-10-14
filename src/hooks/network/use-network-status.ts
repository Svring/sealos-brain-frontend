"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
	ResourceTarget,
} from "@/mvvm/k8s/models/k8s.model";

export const useNetworkStatus = (target: ResourceTarget) => {
	const { launchpad, devbox } = useTRPCClients();

	const query = useQuery(
		target.resourceType === "devbox"
			? devbox.network.queryOptions(target as CustomResourceTarget)
			: launchpad.network.queryOptions(target as BuiltinResourceTarget),
	);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
