"use client";

import { ReactFlow } from "@xyflow/react";
import { FLOW_CONFIG } from "@/constants/flow/flow-config.constant";

import "@xyflow/react/dist/style.css";

interface ProjectFlowViewProps {
	nodes: any[];
	edges: any[];
	onPaneClick?: () => void;
	onEdgeClick?: (event: React.MouseEvent, edge: any) => void;
}

export function ProjectFlowView({
	nodes,
	edges,
	onPaneClick,
	onEdgeClick,
}: ProjectFlowViewProps) {
	return (
		<ReactFlow
			connectionLineType={FLOW_CONFIG.connectionLineType}
			edges={edges}
			fitView
			fitViewOptions={FLOW_CONFIG.fitViewOptions}
			nodes={nodes}
			panOnScroll
			panOnDrag
			zoomOnScroll
			zoomOnPinch
			snapToGrid
			snapGrid={FLOW_CONFIG.snapGrid}
			proOptions={FLOW_CONFIG.proOptions}
			onPaneClick={onPaneClick}
			onEdgeClick={onEdgeClick}
			className="h-full w-full"
		/>
	);
}
