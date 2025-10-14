"use client";

import { BaseNode } from "@/components/flow/nodes/base-node";

interface NetworkNodeViewProps {
	data: any;
}

export function NetworkNodeView({ data }: NetworkNodeViewProps) {
	return <BaseNode width="fixed"></BaseNode>;
}
