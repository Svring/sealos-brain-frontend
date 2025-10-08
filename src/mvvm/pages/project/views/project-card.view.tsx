"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AvatarCircles } from "@/components/ui/avatar-circles";

interface ProjectCardProps {
	project: {
		name: string;
		displayName: string;
		createdAt: string;
	};
	variant?: "full" | "lite";
	onCardClick?: () => void;
	onRename?: () => void;
	onDelete?: () => void;
}

export const ProjectCard = ({
	project,
	variant = "full",
	onCardClick,
	onRename,
	onDelete,
}: ProjectCardProps) => {
	// Mock avatar data for UI demonstration
	const avatarData = {
		avatarUrls: ["/app_launchpad_icon.svg", "/package_icon.svg"],
		numPeople: 0,
	};

	const commonLinkProps = {
		href: `/project/${encodeURIComponent(project.name)}`,
		className: "block h-full w-full",
	};

	return (
		<Link {...commonLinkProps}>
			<motion.div
				className={`relative flex w-full cursor-pointer rounded-lg border bg-background-tertiary text-left shadow-sm ${
					variant === "lite"
						? "h-10 items-center px-3"
						: "min-h-[160px] flex-col p-4 py-3"
				}`}
				whileHover={{ y: -5 }}
				transition={{ duration: 0.15, ease: "easeInOut" }}
			>
				<div className="flex items-center w-full gap-2">
					<div className="flex items-center space-x-1 min-w-0 group flex-1">
						<p className="text-foreground truncate transition-colors">
							{project.displayName}
						</p>
					</div>
					{avatarData.avatarUrls.length > 0 && variant === "lite" && (
						<div className="scale-75 origin-right flex-shrink-0">
							<AvatarCircles
								numPeople={
									avatarData.numPeople > 0 ? avatarData.numPeople : undefined
								}
								avatarUrls={avatarData.avatarUrls}
								disableLink
							/>
						</div>
					)}
				</div>
				{variant === "full" && project.displayName !== project.name && (
					<p className="text-xs text-muted-foreground mb-2">{project.name}</p>
				)}

				{variant === "full" && (
					<div className="absolute bottom-5 left-4 text-xs text-muted-foreground">
						{new Date(project.createdAt).toLocaleDateString()}
					</div>
				)}

				{avatarData.avatarUrls.length > 0 && variant === "full" && (
					<div className="scale-75 origin-right absolute bottom-4 right-4">
						<AvatarCircles
							numPeople={
								avatarData.numPeople > 0 ? avatarData.numPeople : undefined
							}
							avatarUrls={avatarData.avatarUrls}
							disableLink
						/>
					</div>
				)}
			</motion.div>
		</Link>
	);
};
