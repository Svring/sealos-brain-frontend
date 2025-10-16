"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";

export const useClusterLifecycle = () => {
	const { cluster } = useTRPCClients();

	const startMutation = useMutation(cluster.start.mutationOptions());
	const pauseMutation = useMutation(cluster.pause.mutationOptions());
	const restartMutation = useMutation(cluster.restart.mutationOptions());

	const executeAction = async (action: string, clusterName: string) => {
		const target = clusterParser.toTarget(clusterName);
		switch (action) {
			case "start":
				await startMutation.mutateAsync(target);
				break;
			case "pause":
				await pauseMutation.mutateAsync(target);
				break;
			case "restart":
				await restartMutation.mutateAsync(target);
				break;
		}
	};

	return {
		mutate: executeAction,
		isPending: (action: string) => {
			switch (action) {
				case "start":
					return startMutation.isPending;
				case "pause":
					return pauseMutation.isPending;
				case "restart":
					return restartMutation.isPending;
			}
		},
	};
};
