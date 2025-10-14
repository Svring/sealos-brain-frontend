"use client";

import { type Edge, type Node, ReactFlow } from "@xyflow/react";
import FloatingConnectionLine from "@/components/flow/edges/floating-connection-line";
import { FLOW_CONFIG } from "@/constants/flow/flow-config.constant";
import edgeTypes from "@/mvvm/flow/edges/models/edge.types";
import nodeTypes from "@/mvvm/flow/nodes/models/node.types";

import "@xyflow/react/dist/style.css";

interface ProjectFlowViewProps {
	nodes: Node[];
	edges: Edge[];
	onPaneClick?: () => void;
	onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
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
			connectionLineComponent={FloatingConnectionLine}
			edges={edges}
			edgeTypes={edgeTypes}
			nodeTypes={nodeTypes}
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
