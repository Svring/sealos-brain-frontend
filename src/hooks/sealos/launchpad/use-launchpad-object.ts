"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { BuiltinResourceTarget } from "@/mvvm/k8s/models/k8s.model";

export const useLaunchpadObject = (target: BuiltinResourceTarget) => {
	const { launchpad } = useTRPCClients();

	const query = useQuery(launchpad.get.queryOptions(target));

	// console.log("query", query.data);

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
