"use client";

import { HardDrive, Package } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeLog from "@/components/flow/nodes/node-log";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import type { LaunchpadObject } from "@/mvvm/sealos/launchpad/models/launchpad-object.model";

interface LaunchpadNodeViewProps {
	data: LaunchpadObject;
}

export function LaunchpadNodeView({ data }: LaunchpadNodeViewProps) {
	const { name } = data;

	// Extract data based on resource type
	const image = data.image?.imageName || "N/A";

	const storage =
		data.resourceType === "statefulset"
			? (data.resource as { storage: number }).storage || 20
			: undefined;

	// Create target for node components
	const target = launchpadParser.toTarget(name);

	return (
		<BaseNode width="fixed">
			<div className="flex h-full flex-col gap-2 justify-between">
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<NodeTitle
						resourceType={data.resourceType}
						name={name}
						iconURL={image}
					/>

					{/* Actions Dropdown Menu - Simulated */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<div className="w-6 h-6 rounded border border-border bg-background hover:bg-muted cursor-pointer flex items-center justify-center">
							<span className="text-xs">⋯</span>
						</div>
					</div>
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-md text-muted-foreground truncate flex-1">
						Image: {image}
					</div>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status component */}
					<NodeStatus target={target} />

					{/* Right: Action components */}
					<div className="flex items-center gap-2">
						<NodeLog target={target} />
						<NodeMonitor target={target} />
					</div>
				</div>

				{/* Storage Volume Bar - Only for StatefulSet */}
				{data.resourceType === "statefulset" && storage && (
					<div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1">
						<div className="relative z-10 flex items-center justify-between w-full">
							<div className="flex items-center gap-1">
								<HardDrive className="h-5 w-5" />
								<span className="text-md">Storage</span>
							</div>
							<div className="text-xs">{storage}GB</div>
						</div>
					</div>
				)}
			</div>
		</BaseNode>
	);
}
