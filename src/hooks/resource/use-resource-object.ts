"use client";

import { useQueries } from "@tanstack/react-query";
import { resourceParser } from "@/lib/resource/resource.parser";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
	ResourceTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type {
	K8sItem,
	K8sResource,
} from "@/mvvm/k8s/models/k8s-resource.model";
import { useTRPCClients } from "../trpc/use-trpc-clients";

/**
 * Hook to fetch a single resource object
 * @param resource - Single K8sItem, K8sResource, or ResourceTarget object
 * @returns Query result with data, loading states, and errors for the single resource
 */
export const useResourceObject = (
	resource: K8sItem | K8sResource | ResourceTarget,
) => {
	const { devbox, cluster, osb, launchpad } = useTRPCClients();

	const target = resourceParser.toTarget(resource);

	// Create queries for the single target
	const queries = useQueries({
		queries: [
			(() => {
				switch (target.resourceType) {
					case "devbox":
						return devbox.get.queryOptions(target as CustomResourceTarget);
					case "cluster":
						return cluster.get.queryOptions(target as CustomResourceTarget);
					case "objectstoragebucket":
						return osb.get.queryOptions(target as CustomResourceTarget);
					case "deployment":
					case "statefulset":
						return launchpad.get.queryOptions(target as BuiltinResourceTarget);
					default:
						return {
							queryKey: [],
							queryFn: async () => {},
							enabled: false,
						};
				}
			})(),
		],
		combine: (results) => {
			return {
				data: results[0]?.data,
				pending: results[0]?.isPending,
				error: results[0]?.error,
				isLoading: results[0]?.isLoading,
				isSuccess: results[0]?.isSuccess,
				isError: results[0]?.isError,
			};
		},
	});

	return queries;
};
