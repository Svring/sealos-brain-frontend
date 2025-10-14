"use client";

import { useParams } from "next/navigation";
import { useFlow } from "@/hooks/flow/use-flow";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import { PageView } from "../views/page.view";

export const Page = () => {
	const { name } = useParams();

	// Create instance target from name using instanceParser
	const instance = instanceParser.toTarget(name as string);

	// Use flow hook with instance
	const { nodes, edges } = useFlow(instance);
	// TODO: Use flowData to populate nodes and edges
	console.log("Flow data:", { nodes, edges });

	const handlePaneClick = () => {
		// TODO: Implement pane click logic
	};

	const handleEdgeClick = (event: React.MouseEvent) => {
		// TODO: Implement edge click logic
		console.log(event);
	};

	const handleOpenCommand = () => {
		// TODO: Implement command dialog logic
	};

	const handleZoomIn = () => {
		// TODO: Implement zoom in logic
	};

	const handleZoomOut = () => {
		// TODO: Implement zoom out logic
	};

	const handleReset = () => {
		// TODO: Implement reset/fit view logic
	};

	return (
		<PageView
			nodes={nodes}
			edges={edges}
			onPaneClick={handlePaneClick}
			onEdgeClick={handleEdgeClick}
			onOpenCommand={handleOpenCommand}
			onZoomIn={handleZoomIn}
			onZoomOut={handleZoomOut}
			onReset={handleReset}
		/>
	);
};
