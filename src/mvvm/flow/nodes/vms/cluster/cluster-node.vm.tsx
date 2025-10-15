"use client";

import { useClusterObject } from "@/hooks/cluster/use-cluster-object";
import { useNodeClick } from "@/hooks/flow/use-node-click";
import { ClusterNodeView } from "@/mvvm/flow/nodes/views/cluster/cluster-node.view";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

interface ClusterNodeProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function ClusterNode({ data: { target } }: ClusterNodeProps) {
	const { data, isLoading, isError, error } = useClusterObject(target);
	const { handleNodeClick } = useNodeClick({
		resourceUid: data?.uid || "",
		target: target,
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return <ClusterNodeView data={data} onClick={handleNodeClick} />;
}
