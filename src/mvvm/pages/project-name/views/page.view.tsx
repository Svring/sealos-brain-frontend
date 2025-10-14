"use client";

import type { Edge, Node } from "@xyflow/react";
import { useCopilotState } from "@/contexts/copilot/copilot.context";
import { ProjectCopilot } from "../vms/project-copilot.vm";
import { ProjectFlow } from "../vms/project-flow.vm";
import { OverlayControlView } from "./overlay-control.view";

interface PageViewProps {
	nodes: Node[];
	edges: Edge[];
	onOpenCommand?: () => void;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onReset?: () => void;
}

export const PageView = ({
	nodes,
	edges,
	onOpenCommand,
	onZoomIn,
	onZoomOut,
	onReset,
}: PageViewProps) => {
	const { opened } = useCopilotState();

	return (
		<div className="h-full w-full overflow-hidden bg-background rounded-lg flex">
			{/* Left side - Flow */}
			<div
				className={`h-full transition-all duration-200 flex-1`}
			>
				<OverlayControlView
					onOpenCommand={onOpenCommand}
					onZoomIn={onZoomIn}
					onZoomOut={onZoomOut}
					onReset={onReset}
				>
					<ProjectFlow nodes={nodes} edges={edges} />
				</OverlayControlView>
			</div>

			{/* Right side - Copilot */}
			{opened && (
				<div
					className={`${opened ? "w-[35%]" : "w-0"} h-full min-w-[28rem]`}
				>
					<ProjectCopilot />
				</div>
			)}
		</div>
	);
};
