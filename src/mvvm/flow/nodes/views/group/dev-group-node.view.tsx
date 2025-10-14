import type { NodeProps } from "@xyflow/react";

export function DevGroupNodeView() {
	return (
		<div className="relative w-full h-full bg-transparent border border-border-primary border-dashed rounded-xl pointer-events-none">
			<div className="absolute bottom-2 left-2 text-sm font-medium text-muted-foreground">
				Dev
			</div>
		</div>
	);
}
