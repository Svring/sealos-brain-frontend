"use client";

import { Copy, Globe, HardDrive } from "lucide-react";
import * as BaseNode from "@/components/flow/nodes/base-node.comp";
import { Switch } from "@/components/ui/switch";
import { osbParser } from "@/lib/sealos/osb/osb.parser";
import type { OsbObject } from "@/mvvm/sealos/osb/models/osb-object.model";

interface OsbNodeBlockProps {
	data: OsbObject;
}

export function OsbNodeBlock({ data }: OsbNodeBlockProps) {
	const { name, policy, access } = data;
	
	// Create target for node components
	const target = osbParser.toTarget(data);

	const isPublic = policy !== "private";

	const handleStatusClick = () => {
		console.log("Status clicked for OSB:", name);
	};

	const handleCopyClick = () => {
		console.log("Copy access key for OSB:", name);
		// Copy access key to clipboard
		if (access?.accessKey) {
			navigator.clipboard.writeText(access.accessKey);
		}
	};

	const handleStorageClick = () => {
		console.log("Storage management for OSB:", name);
	};

	return (
		<BaseNode.Root target={target}>
			<BaseNode.Header>
				<BaseNode.Title />
			</BaseNode.Header>

			<BaseNode.Content>
				{isPublic && (
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<Globe className="h-4 w-4 text-theme-green" />
							<span className="text-sm text-muted-foreground">Static Hosting</span>
							<Switch checked={true} disabled className="scale-75" />
						</div>
						<BaseNode.Widget
							icon={Copy}
							onClick={handleCopyClick}
							tooltip="Copy access key"
						/>
					</div>
				)}
				{!isPublic && (
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Private Storage</span>
					</div>
				)}
			</BaseNode.Content>

			<BaseNode.Footer>
				<BaseNode.Status onClick={handleStatusClick} />
				<BaseNode.Widget
					icon={HardDrive}
					onClick={handleStorageClick}
					tooltip="Storage management"
				/>
			</BaseNode.Footer>
		</BaseNode.Root>
	);
}