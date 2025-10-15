"use client";

import { Handle, Position } from "@xyflow/react";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";

interface BaseNodeProps {
	width?: "auto" | "fixed";
	children?: React.ReactNode;
	target?: ResourceTarget;
}

export const BaseNode = ({
	width = "fixed",
	children,
	target,
	...props
}: BaseNodeProps) => {
	// Determine the appropriate styling based on props
	const getNodeStyling = () => {
		let baseStyles =
			"relative cursor-pointer rounded-xl border bg-background-secondary p-5 text-card-foreground h-50";

		// Add width classes based on width prop
		if (width === "auto") {
			baseStyles += " w-auto min-w-70 max-w-96";
		} else {
			baseStyles += " w-70";
		}

		// Add hover effect
		baseStyles += " hover:brightness-120";

		return baseStyles;
	};

	return (
		<div className={getNodeStyling()} {...props}>
			<Handle position={Position.Top} type="source" />
			{children}
			<Handle position={Position.Bottom} type="target" />
		</div>
	);
};

BaseNode.displayName = "BaseNode";
