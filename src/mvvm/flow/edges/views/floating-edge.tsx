import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
	useInternalNode,
} from "@xyflow/react";
import { useState } from "react";

import { getEdgeParams } from "@/lib/flow/edge/edge.utils";

function FloatingEdge(props: EdgeProps) {
	const { id, source, target, markerEnd, style, data } = props;
	const [isHovered, setIsHovered] = useState(false);

	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
		sourceNode,
		targetNode,
	);

	const [edgePath] = getBezierPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
	});

	const edgeStyle = {
		strokeWidth: isHovered ? 1.5 : 1,
		transition: "all 0.15s ease-in-out",
		...style,
	};

	// Check if this is a devbox to launchpad connection
	const isDevboxToLaunchpad =
		sourceNode.type === "devbox" &&
		(targetNode.type === "deployment" || targetNode.type === "statefulset") &&
		data?.devboxVersion;

	return (
		<>
			<g style={{ cursor: "default" }}>
				<BaseEdge
					id={id}
					path={edgePath}
					markerEnd={markerEnd}
					style={edgeStyle}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				/>
			</g>

			{isDevboxToLaunchpad && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, 0%) translate(${tx - 30}px,${
								ty - 30
							}px)`,
							background: "transparent",
							border: "none",
							borderRadius: "6px",
							padding: "3px 8px",
							fontSize: "15px",
							fontWeight: "500",
							color: isHovered
								? "var(--color-theme-blue)"
								: "hsl(var(--foreground))",
							pointerEvents: "none",
							whiteSpace: "nowrap",
							// zIndex: 1000,
							boxShadow: "none",
							backdropFilter: "none",
							transition: "color 0.2s ease-in-out",
						}}
					>
						{String(data.devboxVersion)}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}

export default FloatingEdge;
