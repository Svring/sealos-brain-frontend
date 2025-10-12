"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useSearchThreads = (metadata: Record<string, string>) => {
	const { langgraph } = useTRPCClients();

	const query = useQuery(langgraph.searchThreads.queryOptions(metadata));

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		isSuccess: query.isSuccess,
	};
};
