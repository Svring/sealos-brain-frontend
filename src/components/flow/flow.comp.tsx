"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Root container
export const Root = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="flow-root"
			className={cn("h-full w-full", className)}
			{...props}
		/>
	);
};

// Content area
export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="flow-content"
			className={cn("h-full w-full", className)}
			{...props}
		/>
	);
};
