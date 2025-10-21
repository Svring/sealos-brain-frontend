"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { SidebarTrigger as SidebarTriggerPrimitive } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Root container
export const Root = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-root"
			className={cn("relative h-full w-full", className)}
			{...props}
		>
			{children}
		</Comp>
	);
};

// Overlay container for floating controls
export const Overlay = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="control-overlay"
			className={cn("absolute top-2 left-2 z-50", className)}
			{...props}
		>
			{children}
		</Comp>
	);
};

// Sidebar Trigger
export const SidebarTrigger = ({
	className,
	...props
}: ComponentProps<typeof SidebarTriggerPrimitive>) => {
	return (
		<SidebarTriggerPrimitive
			data-slot="control-sidebar-trigger"
			className={cn("", className)}
			{...props}
		/>
	);
};
