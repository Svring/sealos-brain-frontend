"use client";

import {
	Activity,
	Globe,
	MoreVertical,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Trash2,
} from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLaunchpadDelete } from "@/hooks/sealos/launchpad/use-launchpad-delete";
import { useLaunchpadLifecycle } from "@/hooks/sealos/launchpad/use-launchpad-lifecycle";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import type { LaunchpadObject } from "@/mvvm/sealos/launchpad/models/launchpad-object.model";

interface LaunchpadNodeBlockProps {
	data: LaunchpadObject;
}

export function LaunchpadNodeBlock({ data }: LaunchpadNodeBlockProps) {
	const { name, resource, ports } = data;
	const { start, pause, restart, isPending } = useLaunchpadLifecycle();
	const { deleteLaunchpad, isPending: isDeleting } = useLaunchpadDelete();

	// Create target for node components
	const target = launchpadParser.toTarget(name);

	const hasPublicAccess = ports && ports.some(port => port.publicAddress);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for launchpad:", name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for launchpad:", name);
	};

	const handleSettingsClick = () => {
		console.log("Settings clicked for launchpad:", name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete launchpad "${name}"? This action cannot be undone.`,
			)
		) {
			await deleteLaunchpad(name);
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
					icon={Settings}
					onClick={handleSettingsClick}
					tooltip="Application settings"
				/>
			</BaseNode.Footer>
		</BaseNode.Root>
	);
}