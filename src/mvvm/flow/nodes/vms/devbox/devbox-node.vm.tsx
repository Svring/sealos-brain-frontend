"use client";

import { Package } from "lucide-react";
import { BaseNode } from "@/components/flow/nodes/base-node";
import type { DevboxObject } from "@/mvvm/sealos/devbox/models/devbox-object.model";

interface DevboxNodeProps {
	data: DevboxObject;
}

export function DevboxNode({ data }: DevboxNodeProps) {
	const { name, image } = data;
	return (
		<BaseNode width="fixed">
			<div className="flex h-full flex-col gap-2 justify-between">
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<div className="flex flex-col">
						<div className="text-lg font-semibold text-foreground truncate">
							{name}
						</div>
						<div className="text-xs text-muted-foreground">Devbox</div>
					</div>

					{/* Actions Dropdown Menu - Simulated */}
					<div className="flex flex-row items-center gap-2 flex-shrink-0">
						<div className="w-6 h-6 rounded border border-border bg-background hover:bg-muted cursor-pointer flex items-center justify-center">
							<span className="text-xs">⋯</span>
						</div>
					</div>
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-md text-muted-foreground truncate flex-1">
						Image: {image}
					</div>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status light - Simulated */}
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-green-500"></div>
						<span className="text-xs text-muted-foreground">Running</span>
					</div>

					{/* Right: Icon components - Simulated */}
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded border border-border bg-background hover:bg-muted cursor-pointer flex items-center justify-center">
							<span className="text-xs">📊</span>
						</div>
					</div>
				</div>
			</div>
		</BaseNode>
	);
}
