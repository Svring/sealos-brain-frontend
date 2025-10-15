"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";

export const useLaunchpadLifecycle = () => {
	const { launchpad } = useTRPCClients();

	const startMutation = useMutation(launchpad.start.mutationOptions());
	const pauseMutation = useMutation(launchpad.pause.mutationOptions());
	const restartMutation = useMutation(launchpad.restart.mutationOptions());

	const executeAction = async (action: string, launchpadName: string) => {
		const target = launchpadParser.toTarget(launchpadName);
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
