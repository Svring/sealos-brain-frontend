"use client";

import { OverlayControl } from "@/mvvm/pages/project-name/vms/overlay-control.vm";
import { ProjectFlow } from "@/mvvm/pages/project-name/vms/project-flow.vm";

export default function ProjectPage() {
	// Mock data for now - will be replaced with real data later
	const mockNodes = [
		{
			id: "1",
			type: "devbox",
			position: { x: 100, y: 100 },
			data: { label: "DevBox Node" },
		},
		{
			id: "2",
			type: "cluster",
			position: { x: 300, y: 100 },
			data: { label: "Cluster Node" },
		},
	];

	const mockEdges = [
		{
			id: "e1-2",
			source: "1",
			target: "2",
		},
	];

	return (
		<div className="h-full w-full overflow-hidden">
			<OverlayControl>
				<ProjectFlow nodes={mockNodes} edges={mockEdges} />
			</OverlayControl>
		</div>
	);
}
