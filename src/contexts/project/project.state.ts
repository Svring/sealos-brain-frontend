"use client";

import { assign, createMachine } from "xstate";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sItem } from "@/mvvm/k8s/models/k8s-resource.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";

// Resource interface
export interface Resource {
	item: K8sItem;
	target: ResourceTarget;
}

export interface ProjectContext {
	project: InstanceObject | null;
	allResources: Resource[];
	activeResource: Resource | null;
}

export type ProjectEvent =
	| { type: "SET_PROJECT"; project: InstanceObject }
	| { type: "CLEAR_PROJECT" }
	| { type: "SET_ALL_RESOURCES"; resources: Resource[] }
	| { type: "ADD_RESOURCE"; resource: Resource }
	| { type: "UPDATE_RESOURCE"; resource: Resource }
	| { type: "REMOVE_RESOURCE"; resourceId: string }
	| { type: "SET_ACTIVE_RESOURCE"; resource: Resource | null }
	| { type: "CLEAR_ACTIVE_RESOURCE" }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const projectMachine = createMachine({
	types: {} as {
		context: ProjectContext;
		events: ProjectEvent;
	},
	id: "project",
	initial: "idle",
	context: {
		project: null,
		allResources: [],
		activeResource: null,
	},
	states: {
		idle: {
			on: {
				SET_PROJECT: {
					target: "ready",
					actions: assign({ project: ({ event }) => event.project }),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_PROJECT: {
					actions: assign({ project: ({ event }) => event.project }),
				},
				CLEAR_PROJECT: {
					target: "idle",
					actions: assign({
						project: null,
						allResources: [],
						activeResource: null,
					}),
				},
				SET_ALL_RESOURCES: {
					actions: assign({ allResources: ({ event }) => event.resources }),
				},
				ADD_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) => [
							...context.allResources,
							event.resource,
						],
					}),
				},
				UPDATE_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) =>
							context.allResources.map((resource) =>
								resource.item.name === event.resource.item.name
									? event.resource
									: resource,
							),
					}),
				},
				REMOVE_RESOURCE: {
					actions: assign({
						allResources: ({ context, event }) =>
							context.allResources.filter(
								(resource) => resource.item.name !== event.resourceId,
							),
						activeResource: ({ context, event }) =>
							context.activeResource?.item.name === event.resourceId
								? null
								: context.activeResource,
					}),
				},
				SET_ACTIVE_RESOURCE: {
					actions: assign({ activeResource: ({ event }) => event.resource }),
				},
				CLEAR_ACTIVE_RESOURCE: {
					actions: assign({ activeResource: null }),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				SET_PROJECT: {
					target: "ready",
					actions: assign({ project: ({ event }) => event.project }),
				},
				RETRY: "idle",
			},
		},
	},
});
