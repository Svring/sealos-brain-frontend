"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useInstanceDelete = () => {
	const { instance } = useTRPCClients();

	const query = useMutation(instance.delete.mutationOptions());

	return {
		mutate: query.mutate,
		isLoading: query.isPending,
		isError: query.isError,
    isSuccess: query.isSuccess,
	};
};
