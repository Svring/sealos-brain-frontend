"use client";

import { useMount } from "@reactuses/core";
import { useParams } from "next/navigation";
import type React from "react";
import { useProjectEvents } from "@/contexts/project/project.context";

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const { name } = useParams();
	const { setProject } = useProjectEvents();

	useMount(() => {
		setProject({
			name,
		});
	});

	return <>{children}</>;
}
