"use client";

import { Globe, HardDrive } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import NodeBackup from "@/components/flow/nodes/node-backup";
import NodeLog from "@/components/flow/nodes/node-log";
import NodeMonitor from "@/components/flow/nodes/node-monitor";
import NodeStatus from "@/components/flow/nodes/node-status";
import NodeTitle from "@/components/flow/nodes/node-title";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import type { ClusterObject } from "@/mvvm/sealos/cluster/models/cluster-object.model";

interface ClusterNodeViewProps {
	data: ClusterObject;
}

export function ClusterNodeView({ data }: ClusterNodeViewProps) {
	const { name, type, resource } = data;
	const storage = resource.storage;
	const hasPublicAccess = Array.isArray(data.connection.publicConnection);

	// Create target for node components
	const target = clusterParser.toTarget(name);

	return (
		<BaseNode width="fixed">
			<div className="flex h-full flex-col gap-4 justify-between">
				{/* Header with Name and Type */}
				<div className="flex items-center justify-between">
					<NodeTitle
						resourceType={type}
						name={name}
						iconURL="/cluster-icon.svg"
					/>

					{/* Actions Dropdown Menu - Simulated */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<div className="w-6 h-6 rounded border border-border bg-background hover:bg-muted cursor-pointer flex items-center justify-center">
							<span className="text-xs">⋯</span>
						</div>
					</div>
				</div>

				{/* Public Access Status */}
				<div className="flex items-center gap-2 text-md">
					<Globe
						className={`h-4 w-4 ${
							hasPublicAccess ? "text-theme-green" : "text-theme-gray"
						}`}
					/>
					<span
						className={
							hasPublicAccess ? "text-foreground" : "text-muted-foreground"
						}
					>
						Public Access
					</span>
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

				{/* Storage Volume Bar */}
				<div className="relative bg-node-background w-full h-10 flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2">
					<div
						className={`absolute inset-y-0 left-0 ${
							storage > 90
								? "bg-status-error/20"
								: storage > 75
									? "bg-theme-yellow/10"
									: "bg-muted"
						}`}
						style={{ width: `${storage}%` }}
					/>
					<div className="relative z-10 flex items-center justify-between w-full">
						<div className="flex items-center gap-1">
							<HardDrive className="h-5 w-5" />
							<span className="text-md">Volume</span>
						</div>
						<div className="text-xs">{storage} GB</div>
					</div>
				</div>
			</div>
		</BaseNode>
	);
}
