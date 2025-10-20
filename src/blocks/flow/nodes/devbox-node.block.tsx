"use client";

import {
	Activity,
	MoreVertical,
	Package,
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
import { useDevboxDelete } from "@/hooks/sealos/devbox/use-devbox-delete";
import { useDevboxLifecycle } from "@/hooks/sealos/devbox/use-devbox-lifecycle";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import type { DevboxObject } from "@/mvvm/sealos/devbox/models/devbox-object.model";

interface DevboxNodeBlockProps {
	data: DevboxObject;
}

export function DevboxNodeBlock({ data }: DevboxNodeBlockProps) {
	const { name, runtime, status } = data;
	const { start, pause, restart, isPending } = useDevboxLifecycle();
	const { del, isPending: isDeleting } = useDevboxDelete();

	// Create target for node components
	const target = devboxParser.toTarget(name);

	const handleMonitorClick = () => {
		console.log("Monitor clicked for devbox:", name);
	};

	const handleStatusClick = () => {
		console.log("Status clicked for devbox:", name);
	};

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete devbox "${name}"? This action cannot be undone.`,
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
							{status !== "Running" && (
								<DropdownMenuItem
									onClick={() => start(name)}
									disabled={status === "Pending" || isPending.start}
									className={status === "Pending" ? "opacity-50" : ""}
								>
									<Play className="mr-2 h-4 w-4" />
									Start
								</DropdownMenuItem>
							)}
							{status !== "Stopped" && status !== "Shutdown" && (
								<DropdownMenuItem
									onClick={() => pause(name)}
									disabled={status === "Pending" || isPending.pause}
									className={status === "Pending" ? "opacity-50" : ""}
								>
									<Pause className="mr-2 h-4 w-4" />
									Pause
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => restart(name)}
								disabled={status === "Pending" || isPending.restart}
								className={status === "Pending" ? "opacity-50" : ""}
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
				<Package className="h-4 w-4 text-muted-foreground" />
				<div className="text-md text-muted-foreground truncate flex-1">
					Runtime: {runtime}
				</div>
			</BaseNode.Content>

			<BaseNode.Footer>
				<BaseNode.Status onClick={handleStatusClick} />
				<BaseNode.Widget
					icon={Activity}
					onClick={handleMonitorClick}
					tooltip="Analyze resource usage"
				/>
			</BaseNode.Footer>
		</BaseNode.Root>
	);
}
