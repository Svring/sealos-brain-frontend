"use client";

import type { Edge, Node } from "@xyflow/react";
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
	return (
		<div className="h-full w-full overflow-hidden bg-background rounded-lg flex">
			{/* Left side - Flow (70%) */}
			<div className="flex-1 w-[65%] h-full">
				<OverlayControlView
					onOpenCommand={onOpenCommand}
					onZoomIn={onZoomIn}
					onZoomOut={onZoomOut}
					onReset={onReset}
				>
					<ProjectFlow nodes={nodes} edges={edges} />
				</OverlayControlView>
			</div>

			{/* Right side - Copilot (30%) */}
			<div className="w-[35%] h-full">
				<ProjectCopilot />
			</div>
		</div>
	);
};
