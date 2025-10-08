"use client";

import type { ReactNode } from "react";
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
		</div>
	);
};
