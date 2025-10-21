"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { K8sItem } from "@/mvvm/k8s/models/k8s-resource.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";

const cardVariants = cva(
	"relative flex w-full cursor-pointer rounded-lg border bg-background-tertiary text-left shadow-sm flex-col p-4 py-3 transition-all duration-200 hover:brightness-120 ease-out",
	{
		variants: {
			size: {
				default: "min-h-[160px]",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type ProjectCardContextProps = {
	project: InstanceObject;
	resources?: K8sItem[];
};

const ProjectCardContext = createContext<ProjectCardContextProps | null>(null);

const useProjectCard = () => {
	const context = useContext(ProjectCardContext);
	if (!context) {
		throw new Error("useProjectCard must be used within a Card Root");
	}
	return context;
};

// Card Root
export const Root = ({
	className,
	size = "default",
	asChild = false,
	project,
	resources,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof cardVariants> & {
		asChild?: boolean;
		project: InstanceObject;
		resources?: K8sItem[];
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<ProjectCardContext.Provider value={{ project, resources }}>
			<Comp
				data-slot="project-card-root"
				data-size={size}
				className={cn(cardVariants({ size, className }))}
				{...props}
			/>
		</ProjectCardContext.Provider>
	);
};

// Dashboard Root
export const Dashboard = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard"
			className={cn("flex h-full w-full flex-col items-center p-8", className)}
			{...props}
		/>
	);
};

// Dashboard Header
export const DashboardHeader = ({
	className,
	asChild = false,
	title = "Projects",
	searchValue,
	onSearchChange,
	onCreateClick,
	searchPlaceholder = "Search...",
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	title?: string;
	searchValue?: string;
	onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onCreateClick?: () => void;
	searchPlaceholder?: string;
}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-dashboard-header"
			className={cn(
				"mb-6 w-full max-w-4xl flex items-center justify-between",
				className,
			)}
			{...props}
		>
			<h1 className="text-lg font-semibold">{title}</h1>
			<div className="flex items-center gap-2">
				{onSearchChange && (
					<div className="relative">
						<Input
							className="h-8 w-36 pl-8 bg-background-tertiary"
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={onSearchChange}
						/>
						<Search
							className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
							size={16}
						/>
					</div>
				)}
				{onCreateClick && (
					<Button
						size="sm"
						variant="outline"
						onClick={onCreateClick}
						className="h-8 w-8 p-0 bg-background-tertiary"
					>
						<Plus size={16} />
					</Button>
				)}
			</div>
		</Comp>
	);
};

// Card Header
export const CardHeader = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-header"
			className={cn("flex items-center w-full gap-2", className)}
			{...props}
		/>
	);
};

// Card Title
export const CardTitle = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	const { project } = useProjectCard();

	return (
		<Comp
			data-slot="project-card-title"
			className={cn(
				"flex items-center space-x-1 min-w-0 group flex-1",
				className,
			)}
			{...props}
		>
			<p className="text-foreground truncate transition-colors">
				{project.displayName}
			</p>
		</Comp>
	);
};

// Card Menu
export const CardMenu = ({
	className,
	asChild = false,
	children,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-menu"
			className={cn(
				"flex flex-row items-center gap-2 flex-shrink-0",
				className,
			)}
			{...props}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="w-6 h-6 rounded hover:bg-muted cursor-pointer flex items-center justify-center"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="rounded-xl bg-background-tertiary"
				>
					{children}
				</DropdownMenuContent>
			</DropdownMenu>
		</Comp>
	);
};

// Card Footer
export const CardFooter = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="project-card-footer"
			className={cn("mt-auto flex justify-between items-center", className)}
			{...props}
		/>
	);
};

// Card Date
export const CardDate = ({
	className,
	asChild = false,
	format = "short",
	...props
}: ComponentProps<"div"> & {
	asChild?: boolean;
	format?: "short" | "long" | "relative";
}) => {
	const Comp = asChild ? Slot : "div";
	const { project } = useProjectCard();

	const formatDate = (date: string) => {
		const d = new Date(date);
		switch (format) {
			case "long":
				return d.toLocaleDateString(undefined, {
					year: "numeric",
					month: "long",
					day: "numeric",
				});
			case "relative": {
				// Simple relative time
				const now = new Date();
				const diff = now.getTime() - d.getTime();
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				if (days === 0) return "Today";
				if (days === 1) return "Yesterday";
				if (days < 7) return `${days} days ago`;
				return d.toLocaleDateString();
			}
			default:
				return d.toLocaleDateString();
		}
	};

	return (
		<Comp
			data-slot="project-card-date"
			className={cn(
				"absolute bottom-5 left-4 text-xs text-muted-foreground",
				className,
			)}
			{...props}
		>
			{formatDate(project.createdAt)}
		</Comp>
	);
};

// Card Widget
export const CardWidget = ({
	className,
	asChild = false,
	icon: Icon,
	onClick,
	disabled = false,
	...props
}: ComponentProps<"button"> & {
	asChild?: boolean;
	icon: React.ComponentType<{ className?: string }>;
	onClick?: (e: React.MouseEvent) => void;
	disabled?: boolean;
}) => {
	const Comp = asChild ? Slot : "button";

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (onClick && !disabled) {
			onClick(e);
		}
	};

	return (
		<Comp
			data-slot="project-card-widget"
			className={cn(
				"p-1 border-2 rounded-full transition-all duration-200 ease-out",
				disabled
					? "border-muted-foreground/20 cursor-not-allowed opacity-50"
					: "border-muted-foreground/20 hover:border-muted-foreground/40 cursor-pointer",
				className,
			)}
			onClick={handleClick}
			type="button"
			disabled={disabled}
			{...props}
		>
			<Icon
				className={cn(
					"h-4 w-4",
					disabled ? "text-theme-gray" : "text-theme-green",
				)}
			/>
		</Comp>
	);
};
