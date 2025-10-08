"use client";

import { ProjectCard } from "../views/project-card.view";

interface ProjectCardVMProps {
	project: {
		name: string;
		displayName: string;
		createdAt: string;
	};
	variant?: "full" | "lite";
}

export const ProjectCardVM = ({ project, variant = "full" }: ProjectCardVMProps) => {
	const handleCardClick = () => {
		console.log("Navigate to project:", project.name);
		// TODO: Implement navigation logic
	};

	const handleRename = () => {
		console.log("Rename project:", project.name);
		// TODO: Implement rename logic
	};

	const handleDelete = () => {
		console.log("Delete project:", project.name);
		// TODO: Implement delete logic
	};

	return (
		<ProjectCard
			project={project}
			variant={variant}
			onCardClick={handleCardClick}
			onRename={handleRename}
			onDelete={handleDelete}
		/>
	);
};
