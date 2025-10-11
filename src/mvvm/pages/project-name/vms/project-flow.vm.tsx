"use client";

import { ProjectFlowView } from "../views/project-flow.view";

interface ProjectFlowProps {
	nodes?: any[];
	edges?: any[];
}

export function ProjectFlow({ nodes = [], edges = [] }: ProjectFlowProps) {
	// Empty handlers for now - will be filled with real logic later
	const handlePaneClick = () => {
		// TODO: Implement pane click logic
	};

	const handleEdgeClick = (event: React.MouseEvent, edge: any) => {
		// TODO: Implement edge click logic
	};

	return (
		<ProjectFlowView
			nodes={nodes}
			edges={edges}
			onPaneClick={handlePaneClick}
			onEdgeClick={handleEdgeClick}
		/>
	);
}
