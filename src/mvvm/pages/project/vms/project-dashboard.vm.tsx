"use client";

import { useState } from "react";
import { useInstances } from "@/hooks/instance/use-instances";
import { ProjectDashboardView } from "../views/project-dashboard.view";
import { ProjectCard } from "./project-card.vm";

export const ProjectDashboard = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: instances, isLoading, isError } = useInstances();

	// Filter instances based on search term
	const filteredProjects =
		instances?.filter(
			(instance) =>
				instance.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				instance.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleCreateProject = () => {
		console.log("Create new project");
	};

	if (isLoading) {
		return <div>Loading projects...</div>;
	}

	if (isError) {
		return <div>Error loading projects</div>;
	}

	return (
		<ProjectDashboardView
			projects={filteredProjects}
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			onCreateProject={handleCreateProject}
			ProjectCardComponent={ProjectCard}
		/>
	);
};
