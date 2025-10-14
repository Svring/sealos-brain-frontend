"use client";

import { useDevboxObject } from "@/hooks/devbox/use-devbox-object";
import { DevboxNodeView } from "@/mvvm/flow/nodes/views/devbox/devbox-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface DevboxNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function DevboxNode({ data: { target } }: DevboxNodeProps) {
	const { data, isLoading, isError, error } = useDevboxObject(target);

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return <DevboxNodeView data={data} />;
}
