"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { ProjectContext, projectMachine } from "./project.state";

interface ProjectContextValue {
	project: ProjectContext;
	state: StateFrom<typeof projectMachine>;
	send: (event: EventFrom<typeof projectMachine>) => void;
}

export const projectMachineContext = createContext<
	ProjectContextValue | undefined
>(undefined);

export function useProjectContext() {
	const ctx = use(projectMachineContext);
	if (!ctx) {
		throw new Error("useProjectContext must be used within ProjectAdapter");
	}
	return ctx;
}

export function useProjectState() {
	const { state } = useProjectContext();

	if (state.matches("failed")) {
		throw new Error("Project initialization failed");
	}

	// Directly expose the data fields
	return {
		project: state.context.project,
		allResources: state.context.allResources,
		activeResource: state.context.activeResource,
		isIdle: state.matches("idle"),
		isReady: state.matches("ready"),
		isFailed: state.matches("failed"),
	};
}

export function useProjectEvents() {
	const { send } = useProjectContext();

	return {
		setProject: (project: any) => send({ type: "SET_PROJECT", project }),
		clearProject: () => send({ type: "CLEAR_PROJECT" }),
		setAllResources: (resources: any[]) =>
			send({ type: "SET_ALL_RESOURCES", resources }),
		addResource: (resource: any) => send({ type: "ADD_RESOURCE", resource }),
		updateResource: (resource: any) =>
			send({ type: "UPDATE_RESOURCE", resource }),
		removeResource: (resourceUid: string) =>
			send({ type: "REMOVE_RESOURCE", resourceUid }),
		setActiveResource: (resource: any) =>
			send({ type: "SET_ACTIVE_RESOURCE", resource }),
		clearActiveResource: () => send({ type: "CLEAR_ACTIVE_RESOURCE" }),
		fail: () => send({ type: "FAIL" }),
		retry: () => send({ type: "RETRY" }),
	};
}
