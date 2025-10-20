"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const chatVariants = cva(
	"h-full w-full flex flex-col bg-background-tertiary border rounded-lg",
	{
		variants: {
			size: {
				default: "h-96 w-full",
				compact: "h-64 w-full",
				full: "h-full w-full",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export type RootProps = ComponentProps<"div"> &
	VariantProps<typeof chatVariants> & {
		asChild?: boolean;
	};

export const Root = ({
	className,
	size = "default",
	asChild = false,
	...props
}: RootProps) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-root"
			data-size={size}
			className={cn(chatVariants({ size, className }))}
			{...props}
		/>
	);
};

export const Header = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-header"
			className={cn(
				"flex items-center justify-between p-4 border-b",
				className,
			)}
			{...props}
		/>
	);
};

export const Footer = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chat-footer"
			className={cn(
				"flex items-center justify-between p-4 border-t",
				className,
			)}
			{...props}
		/>
	);
};

export const Chatbox = ({
	className,
	size = "default",
	asChild = false,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof chatVariants> & {
		asChild?: boolean;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="chatbox"
			data-size={size}
			className={cn(chatVariants({ size, className }))}
			{...props}
		/>
	);
};
