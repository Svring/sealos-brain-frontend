"use client";

import type { Edge, Node } from "@xyflow/react";
import { OverlayControlView } from "./overlay-control.view";
import { ProjectFlowView } from "./project-flow.view";

interface PageViewProps {
	nodes: Node[];
	edges: Edge[];
	onPaneClick?: () => void;
	onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
	onOpenCommand?: () => void;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onReset?: () => void;
}

export const PageView = ({
	nodes,
	edges,
	onPaneClick,
	onEdgeClick,
	onOpenCommand,
	onZoomIn,
	onZoomOut,
	onReset,
}: PageViewProps) => {
	return (
		<div className="h-full w-full overflow-hidden">
			<OverlayControlView
				onOpenCommand={onOpenCommand}
				onZoomIn={onZoomIn}
				onZoomOut={onZoomOut}
				onReset={onReset}
			>
				<ProjectFlowView
					nodes={nodes}
					edges={edges}
					onPaneClick={onPaneClick}
					onEdgeClick={onEdgeClick}
				/>
			</OverlayControlView>
		</div>
	);
};
