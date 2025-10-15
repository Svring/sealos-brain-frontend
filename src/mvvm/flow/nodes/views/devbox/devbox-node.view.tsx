"use client";

import { Package } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeBackup from "@/components/flow/nodes/node-backup";
import NodeLog from "@/components/flow/nodes/node-log";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { DEVBOX_ICON_BASE_URL } from "@/constants/devbox/devbox-icons.constant";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import type { DevboxObject } from "@/mvvm/sealos/devbox/models/devbox-object.model";

interface DevboxNodeViewProps {
	data: DevboxObject;
}

export function DevboxNodeView({ data }: DevboxNodeViewProps) {
	const { name, runtime, resourceType } = data;

	// Create target for node components
	const target = devboxParser.toTarget(name);

	const iconURL = `${DEVBOX_ICON_BASE_URL}/${runtime}.svg`;

	return (
		<BaseNode width="fixed">
			<div className="flex h-full flex-col gap-2 justify-between">
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<NodeTitle
						resourceType={resourceType}
						name={name}
						iconURL={iconURL}
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
						Runtime: {runtime}
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
						<NodeBackup target={target} />
					</div>
				</div>
			</div>
		</BaseNode>
	);
}
