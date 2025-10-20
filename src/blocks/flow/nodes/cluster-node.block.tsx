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
import { Spinner } from "@/components/ui/spinner";
import { useResourceObject } from "@/hooks/resource/use-resource-object";
import { useClusterDelete } from "@/hooks/sealos/cluster/use-cluster-delete";
import { useClusterLifecycle } from "@/hooks/sealos/cluster/use-cluster-lifecycle";
import type { CustomResourceTarget } from "@/models/k8s/k8s-custom.model";
import { ClusterObjectSchema } from "@/models/sealos/cluster/cluster-object.model";

interface ClusterNodeBlockProps {
	data: {
		target: CustomResourceTarget;
	};
}

export function ClusterNodeBlock({ data }: ClusterNodeBlockProps) {
	const { target } = data;
	const { data: object, isLoading } = useResourceObject(target);

	const { start, pause, restart, isPending } = useClusterLifecycle();
	const { del, isPending: isDeleting } = useClusterDelete();

	if (isLoading || !object) {
		return (
			<BaseNode.Root target={target}>
				<BaseNode.Header>
					<BaseNode.Title />
				</BaseNode.Header>
				<BaseNode.Content>
					<Spinner className="h-4 w-4" />
				</BaseNode.Content>
			</BaseNode.Root>
		);
	}

	const cluster = ClusterObjectSchema.parse(object);

	const hasPublicAccess = Array.isArray(cluster.connection.publicConnection);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for cluster:", cluster.name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for cluster:", cluster.name);
	};

	const handleBackupClick = () => {
		console.log("Backup clicked for cluster:", cluster.name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete cluster "${cluster.name}"? This action cannot be undone.`,
			)
		) {
			await del(cluster.name);
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
							{cluster.status !== "Running" && (
								<DropdownMenuItem
									onClick={() => start(cluster.name)}
									disabled={cluster.status === "Pending" || isPending.start}
									className={cluster.status === "Pending" ? "opacity-50" : ""}
								>
									<Play className="mr-2 h-4 w-4" />
									Start
								</DropdownMenuItem>
							)}
							{cluster.status !== "Stopped" &&
								cluster.status !== "Shutdown" && (
									<DropdownMenuItem
										onClick={() => pause(cluster.name)}
										disabled={cluster.status === "Pending" || isPending.pause}
										className={cluster.status === "Pending" ? "opacity-50" : ""}
									>
										<Pause className="mr-2 h-4 w-4" />
										Pause
									</DropdownMenuItem>
								)}
							<DropdownMenuItem
								onClick={() => restart(cluster.name)}
								disabled={cluster.status === "Pending" || isPending.restart}
								className={cluster.status === "Pending" ? "opacity-50" : ""}
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
