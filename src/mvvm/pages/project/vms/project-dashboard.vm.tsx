"use client";

import { useState } from "react";
import { ProjectDashboardView } from "../views/project-dashboard.view";
import { ProjectCardVM } from "./project-card.vm";

export const ProjectDashboard = () => {
	const [searchTerm, setSearchTerm] = useState("");

	// Mock projects data for demonstration
	const mockProjects = [
		{
			name: "my-nextjs-app",
			displayName: "My Next.js App",
			createdAt: "2024-01-15T10:30:00Z",
		},
		{
			name: "react-dashboard",
			displayName: "React Dashboard",
			createdAt: "2024-01-10T14:20:00Z",
		},
		{
			name: "api-service",
			displayName: "API Service",
			createdAt: "2024-01-05T09:15:00Z",
		},
		{
			name: "mobile-app",
			displayName: "Mobile App",
			createdAt: "2023-12-28T16:45:00Z",
		},
		{
			name: "data-pipeline",
			displayName: "Data Pipeline",
			createdAt: "2023-12-20T11:30:00Z",
		},
		{
			name: "ml-model",
			displayName: "ML Model",
			createdAt: "2023-12-15T13:20:00Z",
		},
	];

	// Filter projects based on search term
	const filteredProjects = mockProjects.filter((project) =>
		project.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		project.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleCreateProject = () => {
		console.log("Create new project");
	};

	return (
		<ProjectDashboardView 
			projects={filteredProjects}
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			onCreateProject={handleCreateProject}
			ProjectCardComponent={ProjectCardVM}
		/>
	);
};
