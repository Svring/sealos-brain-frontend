"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useLaunchpadCreate = () => {
	const { launchpad } = useTRPCClients();

	const mutation = useMutation(launchpad.create.mutationOptions());

	return mutation;
};
