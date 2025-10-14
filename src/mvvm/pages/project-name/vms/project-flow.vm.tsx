"use client";

import type { Edge, Node } from "@xyflow/react";
import { useAuthState } from "@/contexts/auth/auth.context";
import {
	useCopilotEvents,
	useCopilotState,
} from "@/contexts/copilot/copilot.context";
import { composeMetadata } from "@/lib/langgraph/langgraph.utils";
import { ProjectFlowView } from "../views/project-flow.view";

interface ProjectFlowProps {
	nodes?: Node[];
	edges?: Edge[];
}

export function ProjectFlow({ nodes = [], edges = [] }: ProjectFlowProps) {
	const { auth } = useAuthState();
	const { chats, opened } = useCopilotState();
	const { addChat, closeCopilot } = useCopilotEvents();

	const handlePaneClick = () => {
		const newMetadata = composeMetadata(auth?.kubeconfigEncoded);
		const latestChat = chats[chats.length - 1];

		// Check if the latest chat has the same metadata
		if (
			latestChat && opened &&
			JSON.stringify(latestChat.metadata) === JSON.stringify(newMetadata)
		) {
			closeCopilot();
		} else {
			addChat({
				metadata: newMetadata,
			});
		}
	};

	const handleEdgeClick = (event: React.MouseEvent) => {
		// TODO: Implement edge click logic
		console.log(event);
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
