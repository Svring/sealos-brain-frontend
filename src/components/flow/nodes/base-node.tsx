"use client";

import { Handle, Position } from "@xyflow/react";
import {
	useProjectEvents,
	useProjectState,
} from "@/contexts/project/project.context";
import { useAddChat } from "@/hooks/copilot/use-add-chat";
import { useResourceObject } from "@/hooks/resource/use-resource-object";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface BaseNodeProps {
	children?: React.ReactNode;
	target: ResourceTarget;
	height?: number;
}

export const BaseNode = ({
	children,
	target,
	height = 50,
}: BaseNodeProps) => {
	const { project } = useProjectState();
	const { setActiveResource } = useProjectEvents();
	const { data } = useResourceObject(target);
	const { handleAddChat } = useAddChat();

	const handleNodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) {
			return;
		}
		if (!data?.uid) {
			console.warn("No resource ID found for target:", target);
			return;
		}

		// Set the active resource
		setActiveResource({
			uid: data.uid,
			target: target,
		});

		// Add chat with project and resource ID
		handleAddChat(project?.uid, data.uid);
	};

	// Determine the appropriate styling based on props
	const getNodeStyling = () => {
		let baseStyles =
			"relative cursor-pointer rounded-xl border bg-background-secondary p-5 text-card-foreground hover:brightness-120";

		// Add height and width classes
		baseStyles += ` h-${height} w-70`;

		return baseStyles;
	};

	return (
		<div className={getNodeStyling()} onClick={handleNodeClick}>
			<Handle position={Position.Top} type="source" />
			{children}
			<Handle position={Position.Bottom} type="target" />
		</div>
	);
};

BaseNode.displayName = "BaseNode";
