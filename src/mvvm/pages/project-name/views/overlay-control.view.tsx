"use client";

import {
	Command,
	Scan,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
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
		<div className="relative">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50">
				<SidebarTrigger />
			</div>

			{/* Right side floating actions */}
			<div className="absolute top-2 right-2 z-40 bg-background/30 backdrop-blur-lg rounded-lg p-2 transition-all duration-300 ease-in-out">
				<TooltipProvider>
					<div className="flex items-center gap-1">
						{/* Zoom In Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={onZoomIn}
								>
									<ZoomIn className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Zoom In</p>
							</TooltipContent>
						</Tooltip>

						{/* Zoom Out Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={onZoomOut}
								>
									<ZoomOut className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Zoom Out</p>
							</TooltipContent>
						</Tooltip>

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

						{/* Command Button */}
						{/* <Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									className="h-7 px-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-1"
									onClick={onOpenCommand}
								>
									<Command className="h-3 w-3" />
									<span className="text-sm font-medium">+ K</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Open Command Menu</p>
							</TooltipContent>
						</Tooltip> */}

					</div>
				</TooltipProvider>
			</div>
		</div>
	);
};
