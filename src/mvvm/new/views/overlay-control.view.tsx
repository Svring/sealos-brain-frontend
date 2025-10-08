"use client";

import { SquarePen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface OverlayControlProps {
	children: ReactNode;
	className?: string;
}

export const OverlayControl = ({
	children,
	className,
}: OverlayControlProps) => {
	return (
		<div className={cn("relative", className)}>
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50">
				<SidebarTrigger />
			</div>
			<div className="absolute top-2 right-2 z-50">
				<Button variant="ghost" size="icon" className="h-8 w-8 [&_svg]:!size-4.5">
					<SquarePen className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
