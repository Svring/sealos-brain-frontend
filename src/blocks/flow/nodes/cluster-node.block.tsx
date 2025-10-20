"use client";

import {
	Activity,
	Globe,
	HardDrive,
	MoreVertical,
	Pause,
	Play,
	RotateCcw,
	Trash2,
} from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClusterDelete } from "@/hooks/sealos/cluster/use-cluster-delete";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import type { ClusterObject } from "@/mvvm/sealos/cluster/models/cluster-object.model";

interface ClusterNodeBlockProps {
	data: ClusterObject;
}

export function ClusterNodeBlock({ data }: ClusterNodeBlockProps) {
	const { name, type, resource, connection } = data;
	const { start, pause, restart, isPending } = useClusterLifecycle();
	const { del, isPending: isDeleting } = useClusterDelete();

	// Create target for node components
	const target = clusterParser.toTarget(name);

	const hasPublicAccess = Array.isArray(connection.publicConnection);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for cluster:", name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for cluster:", name);
	};

	const handleBackupClick = () => {
		console.log("Backup clicked for cluster:", name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete cluster "${name}"? This action cannot be undone.`,
			)
		) {
			await del(name);
		}
	};

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Header>
				<BaseNode.Title />
				<BaseNode.Menu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<BaseNode.Widget icon={MoreVertical} />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="rounded-xl bg-background-tertiary"
							align="start"
						>
							{data.status !== "Running" && (
								<DropdownMenuItem
									onClick={() => start(name)}
									disabled={data.status === "Pending" || isPending.start}
									className={data.status === "Pending" ? "opacity-50" : ""}
								>
									<Play className="mr-2 h-4 w-4" />
									Start
								</DropdownMenuItem>
							)}
							{data.status !== "Stopped" && data.status !== "Shutdown" && (
								<DropdownMenuItem
									onClick={() => pause(name)}
									disabled={data.status === "Pending" || isPending.pause}
									className={data.status === "Pending" ? "opacity-50" : ""}
								>
									<Pause className="mr-2 h-4 w-4" />
									Pause
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => restart(name)}
								disabled={data.status === "Pending" || isPending.restart}
								className={data.status === "Pending" ? "opacity-50" : ""}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Restart
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleDelete}
								className="text-destructive"
								disabled={isDeleting}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{isDeleting ? "Deleting..." : "Delete"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</BaseNode.Menu>
			</BaseNode.Header>

			<BaseNode.Content>
				<Globe
					className={`h-4 w-4 ${
						hasPublicAccess ? "text-theme-green" : "text-muted-foreground"
					}`}
				/>
				<div className="text-md text-muted-foreground truncate flex-1">
					{hasPublicAccess ? "Public Access" : "Private Access"}
				</div>
			</BaseNode.Content>

			<BaseNode.Footer>
				<BaseNode.Status onClick={handleStatusClick} />
				<BaseNode.Widget
					icon={Activity}
					onClick={handleMonitorClick}
					tooltip="Analyze resource usage"
				/>
				<BaseNode.Widget
					icon={HardDrive}
					onClick={handleBackupClick}
					tooltip="Backup management"
				/>
			</BaseNode.Footer>
		</BaseNode.Root>
	);
}
