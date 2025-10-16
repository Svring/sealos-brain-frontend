"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";

export const useDevboxLifecycle = () => {
	const { devbox } = useTRPCClients();

	const startMutation = useMutation(devbox.start.mutationOptions());
	const pauseMutation = useMutation(devbox.pause.mutationOptions());
	const restartMutation = useMutation(devbox.restart.mutationOptions());
	const shutdownMutation = useMutation(devbox.shutdown.mutationOptions());

	const executeAction = async (action: string, devboxName: string) => {
		const target = devboxParser.toTarget(devboxName);
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
			case "shutdown":
				await shutdownMutation.mutateAsync(target);
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
				case "shutdown":
					return shutdownMutation.isPending;
			}
		},
	};
};
