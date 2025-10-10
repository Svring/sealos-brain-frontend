"use client";

import { SquarePen } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface OverlayControlProps {
	children: ReactNode;
}

export const OverlayControl = ({
	children,
}: OverlayControlProps) => {
	return (
		<div className="relative">
			{children}

			{/* Floating control buttons overlay */}
			<div className="absolute top-2 left-2 z-50 flex">
				<SidebarTrigger />
				<Button variant="ghost" size="icon" className="h-8 w-8 [&_svg]:!size-4.5">
					<SquarePen className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
