"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";

export const useClusterMonitor = (target: CustomResourceTarget) => {
	const { cluster } = useTRPCClients();

	const query = useQuery(cluster.monitor.queryOptions(target));

	console.log("cluster monitor query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
