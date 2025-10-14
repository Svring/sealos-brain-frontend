"use client";

import { useQuery } from "@tanstack/react-query";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import { useDevboxObject } from "../devbox/use-devbox-object";
import { useTRPCClients } from "../trpc/use-trpc-clients";

export const useInstanceResources = (target: CustomResourceTarget) => {
	const { instance } = useTRPCClients();

	const query = useQuery(instance.resources.queryOptions(target));

	useDevboxObject({
		type: "custom",
		name: "frontend-dev-pji581",
		resourceType: "devbox",
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
	};
};
