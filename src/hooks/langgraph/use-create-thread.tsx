"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useCreateThread = (metadata: Record<string, string>) => {
	const { langgraph } = useTRPCClients();

	const mutation = useMutation(
		langgraph.createThread.mutationOptions(metadata),
	);

	return {
		mutate: mutation.mutate,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		isSuccess: mutation.isSuccess,
	};
};
