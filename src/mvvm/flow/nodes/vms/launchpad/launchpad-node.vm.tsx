"use client";

import { useNodeClick } from "@/hooks/flow/use-node-click";
import { useLaunchpadObject } from "@/hooks/launchpad/use-launchpad-object";
import { LaunchpadNodeView } from "@/mvvm/flow/nodes/views/launchpad/launchpad-node.view";
import type { BuiltinResourceTarget } from "@/mvvm/k8s/models/k8s-builtin.model";

interface LaunchpadNodeProps {
	data: {
		target: BuiltinResourceTarget;
	};
}

export function LaunchpadNode({ data: { target } }: LaunchpadNodeProps) {
	const { data, isLoading, isError, error } = useLaunchpadObject(target);
	const { handleNodeClick } = useNodeClick({
		resourceUid: data?.uid || "",
		target: target,
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error: {error?.message}</div>;
	if (!data) return <div>No data</div>;

	return <LaunchpadNodeView data={data} onClick={handleNodeClick} />;
}
