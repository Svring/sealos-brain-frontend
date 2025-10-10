"use client";

import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";
import { ProjectCardView } from "../views/project-card.view";

export const ProjectCard = ({ project }: { project: InstanceObject }) => {
	return <ProjectCardView project={project} />;
};
