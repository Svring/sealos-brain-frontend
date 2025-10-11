"use client";

import type { ReactNode } from "react";
import { OverlayControlView } from "../views/overlay-control.view";

interface OverlayControlProps {
	children: ReactNode;
}

export function OverlayControl({ children }: OverlayControlProps) {
	// Empty handlers for now - will be filled with real logic later
	const handleOpenCommand = () => {
		// TODO: Implement command dialog logic
	};

	const handleZoomIn = () => {
		// TODO: Implement zoom in logic
	};

	const handleZoomOut = () => {
		// TODO: Implement zoom out logic
	};

	const handleReset = () => {
		// TODO: Implement reset/fit view logic
	};

	return (
		<OverlayControlView
			onOpenCommand={handleOpenCommand}
			onZoomIn={handleZoomIn}
			onZoomOut={handleZoomOut}
			onReset={handleReset}
		>
			{children}
		</OverlayControlView>
	);
}
