"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export const useClusterDelete = () => {
	const { cluster } = useTRPCClients();

	const mutation = useMutation(cluster.delete.mutationOptions());

	return mutation;
};
