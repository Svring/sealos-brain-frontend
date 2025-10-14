"use client";

import { Command, Scan, ZoomIn, ZoomOut } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface OverlayControlProps {
	children: ReactNode;
	onOpenCommand?: () => void;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onReset?: () => void;
}

export const OverlayControlView = ({
	children,
	onOpenCommand,
	onZoomIn,
	onZoomOut,
	onReset,
}: OverlayControlProps) => {
	return (
		<div className="relative h-full w-full">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50">
				<SidebarTrigger />
			</div>

			{/* Right side floating actions */}
			<div className="absolute top-2 right-2 z-40 bg-background/30 backdrop-blur-lg rounded-lg transition-all duration-300 ease-in-out">
				<TooltipProvider>
					<div className="flex items-center gap-1">
						{/* Reset Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={onReset}
								>
									<Scan className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Reset</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			</div>
		</div>
	);
};
