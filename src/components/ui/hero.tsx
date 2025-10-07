"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	href?: string;
	label: string;
	onClick?: () => void;
}

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
	gradient?: boolean;
	blur?: boolean;
	heroTitle: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: ActionProps[];
	titleClassName?: string;
	subtitleClassName?: string;
	actionsClassName?: string;
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
	(
		{
			className,
			gradient = true,
			blur = true,
			heroTitle,
			subtitle,
			actions,
			titleClassName,
			subtitleClassName,
			actionsClassName,
			...props
		},
		ref,
	) => {
		return (
			<section
				ref={ref}
				className={cn(
					"relative z-0 flex h-[43vh] w-full items-end justify-center overflow-hidden rounded-md bg-transparent",
					className,
				)}
				{...props}
			>
				{gradient && (
					<div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
						{/* Main glow */}
						<div className="absolute inset-auto z-50 h-40 w-md -translate-y-[-30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

						{/* Lamp effect */}
						<motion.div
							initial={{ width: "12rem" }}
							viewport={{ once: true }}
							transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
							whileInView={{ width: "20rem" }}
							className="absolute top-0 z-30 h-40 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
						/>

						{/* Top line removed to eliminate white bar at the top */}

						{/* Left gradient cone */}
						<motion.div
							initial={{ opacity: 0.5, width: "15rem" }}
							whileInView={{ opacity: 1, width: "34rem" }}
							transition={{
								delay: 0.3,
								duration: 0.8,
								ease: "easeInOut",
							}}
							style={{
								backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
							}}
							className="absolute inset-auto right-1/2 h-60 overflow-visible w-136 bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
						>
							<div className="absolute w-full left-0 bg-background h-40 bottom-0 z-20 mask-[linear-gradient(to_top,white,transparent)]" />
							<div className="absolute w-40 h-full left-0 bg-background bottom-0 z-20 mask-[linear-gradient(to_right,white,transparent)]" />
						</motion.div>

						{/* Right gradient cone */}
						<motion.div
							initial={{ opacity: 0.5, width: "15rem" }}
							whileInView={{ opacity: 1, width: "34rem" }}
							transition={{
								delay: 0.3,
								duration: 0.8,
								ease: "easeInOut",
							}}
							style={{
								backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
							}}
							className="absolute inset-auto left-1/2 h-60 w-136 bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
						>
							<div className="absolute w-40 h-full right-0 bg-background bottom-0 z-20 mask-[linear-gradient(to_left,white,transparent)]" />
							<div className="absolute w-full right-0 bg-background h-40 bottom-0 z-20 mask-[linear-gradient(to_top,white,transparent)]" />
						</motion.div>
					</div>
				)}

				<motion.div
					initial={{ y: 100, opacity: 0.5 }}
					viewport={{ once: true }}
					transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
					whileInView={{ y: 0, opacity: 1 }}
					className="relative  z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4 -translate-y-7"
				>
					<div className="flex flex-col items-center text-center gap-2">
						<h1
							className={cn(
								"text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight p-0 m-0",
								titleClassName,
							)}
						>
							{heroTitle}
						</h1>
						{subtitle && (
							<p
								className={cn(
									"text-xl text-muted-foreground p-0 m-0",
									subtitleClassName,
								)}
							>
								{subtitle}
							</p>
						)}
						{actions && actions.length > 0 && (
							<div className={cn("flex gap-4 p-0 m-0", actionsClassName)}>
								{actions.map((action: ActionProps) => (
									<Button
										key={action.label}
										variant={action.variant || "default"}
										onClick={action.onClick}
									>
										{action.label}
									</Button>
								))}
							</div>
						)}
					</div>
				</motion.div>
			</section>
		);
	},
);
Hero.displayName = "Hero";

export { Hero };
