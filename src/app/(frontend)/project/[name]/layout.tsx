"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useProjectEvents } from "@/contexts/project/project.context";
import { useInstanceObject } from "@/hooks/sealos/instance/use-instance-object";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { name } = useParams();
	const { setProject } = useProjectEvents();
	const { data: instance } = useInstanceObject(
		instanceParser.toTarget(name as string),
	);

	useEffect(() => {
		if (instance) {
			setProject(instance);
		}
	}, [instance, setProject]);

	return <>{children}</>;
}
