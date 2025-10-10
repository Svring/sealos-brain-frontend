"use server";

import type { Operation } from "fast-json-patch";
import { POD_LABELS } from "@/constants/pod/pod-label.constant";
import { eventParser } from "@/lib/event/event.parser";
import { podParser } from "@/lib/pod/pod.parser";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
	ResourceTarget,
	ResourceTypeTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { k8sParser } from "./k8s.parser";
import {
	applyResource as applyResourceMutation,
	deleteBuiltinResource,
	deleteCustomResource,
	patchBuiltinResource,
	patchBuiltinResourceMetadata,
	patchCustomResource,
	patchCustomResourceMetadata,
	removeBuiltinResourceMetadata,
	removeCustomResourceMetadata,
	strategicMergePatchBuiltinResource,
	strategicMergePatchCustomResource,
	upsertBuiltinResource,
	upsertCustomResource,
} from "./k8s-mutation.api";
import {
	getBuiltinResource,
	getCustomResource,
	getEventsByPod,
	getLogsByPod,
	listBuiltinResources,
	listCustomResources,
} from "./k8s-query.api";

// ============================================================================
// Unified Kubernetes Service API Functions
// ============================================================================

/**
 * List resources automatically determining if they are builtin or custom.
 *
 * @example
 * ```typescript
 * // List custom resources
 * const instances = await listResources(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   label: "app",
 *   name: "my-app"
 * });
 *
 * // List builtin resources
 * const pods = await listResources(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   label: "app",
 *   name: "my-app"
 * });
 * ```
 */
export const listResources = async (
	context: K8sContext,
	target: ResourceTypeTarget,
) => {
	if (target.type === "custom") {
		return await listCustomResources(
			context,
			target as CustomResourceTypeTarget,
		);
	} else {
		return await listBuiltinResources(
			context,
			target as BuiltinResourceTypeTarget,
		);
	}
};

/**
 * Get a specific resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Get custom resource
 * const instance = await getResource(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   name: "my-instance"
 * });
 *
 * // Get builtin resource
 * const pod = await getResource(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   name: "my-pod"
 * });
 * ```
 */
export const getResource = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	if (target.type === "custom") {
		return await getCustomResource(context, target as CustomResourceTarget);
	} else {
		return await getBuiltinResource(context, target as BuiltinResourceTarget);
	}
};

/**
 * Delete a resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Delete custom resource
 * await deleteResource(context, {
 *   type: "custom",
 *   resourceType: "instance",
 *   name: "my-instance"
 * });
 *
 * // Delete builtin resource
 * await deleteResource(context, {
 *   type: "builtin",
 *   resourceType: "pod",
 *   name: "my-pod"
 * });
 * ```
 */
export const deleteResource = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	if (target.type === "custom") {
		return await deleteCustomResource(context, target as CustomResourceTarget);
	} else {
		return await deleteBuiltinResource(
			context,
			target as BuiltinResourceTarget,
		);
	}
};

/**
 * Upsert (create or update) a resource automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Upsert custom resource
 * const instance = await upsertResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   { metadata: { name: "my-instance" }, spec: { ... } }
 * );
 *
 * // Upsert builtin resource
 * const pod = await upsertResource(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   { metadata: { name: "my-pod" }, spec: { ... } }
 * );
 * ```
 */
export const upsertResource = async (
	context: K8sContext,
	target: ResourceTarget,
	resourceBody: Record<string, unknown>,
) => {
	if (target.type === "custom") {
		return await upsertCustomResource(
			context,
			target as CustomResourceTarget,
			resourceBody,
		);
	} else {
		return await upsertBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			resourceBody,
		);
	}
};

/**
 * Patch resource metadata (annotations or labels) automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Patch custom resource metadata
 * await patchResourceMetadata(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   "labels", "app", "my-app"
 * );
 *
 * // Patch builtin resource metadata
 * await patchResourceMetadata(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   "annotations", "description", "My pod"
 * );
 * ```
 */
export const patchResourceMetadata = async (
	context: K8sContext,
	target: ResourceTarget,
	metadataType: "annotations" | "labels",
	key: string,
	value: string,
) => {
	if (target.type === "custom") {
		return await patchCustomResourceMetadata(
			context,
			target as CustomResourceTarget,
			metadataType,
			key,
			value,
		);
	} else {
		return await patchBuiltinResourceMetadata(
			context,
			target as BuiltinResourceTarget,
			metadataType,
			key,
			value,
		);
	}
};

/**
 * Remove resource metadata (annotations or labels) automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Remove custom resource metadata
 * await removeResourceMetadata(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   "labels", "app"
 * );
 *
 * // Remove builtin resource metadata
 * await removeResourceMetadata(context,
 *   { type: "builtin", resourceType: "pod", name: "my-pod" },
 *   "annotations", "description"
 * );
 * ```
 */
export const removeResourceMetadata = async (
	context: K8sContext,
	target: ResourceTarget,
	metadataType: "annotations" | "labels",
	key: string,
) => {
	if (target.type === "custom") {
		return await removeCustomResourceMetadata(
			context,
			target as CustomResourceTarget,
			metadataType,
			key,
		);
	} else {
		return await removeBuiltinResourceMetadata(
			context,
			target as BuiltinResourceTarget,
			metadataType,
			key,
		);
	}
};

/**
 * Patch a resource with arbitrary patch operations automatically determining if it's builtin or custom.
 *
 * @example
 * ```typescript
 * // Patch custom resource
 * await patchResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   [{ op: "replace", path: "/spec/replicas", value: 3 }]
 * );
 *
 * // Patch builtin resource
 * await patchResource(context,
 *   { type: "builtin", resourceType: "deployment", name: "my-deployment" },
 *   [{ op: "replace", path: "/spec/replicas", value: 5 }]
 * );
 * ```
 */
export const patchResource = async (
	context: K8sContext,
	target: ResourceTarget,
	patchBody: Operation[],
) => {
	if (target.type === "custom") {
		return await patchCustomResource(
			context,
			target as CustomResourceTarget,
			patchBody,
		);
	} else {
		return await patchBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			patchBody,
		);
	}
};

/**
 * Strategic merge patch for a resource automatically determining if it's builtin or custom.
 * This allows partial updates without needing to get the full resource first.
 *
 * @example
 * ```typescript
 * // Strategic merge patch custom resource
 * await strategicMergePatchResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   { spec: { replicas: 3 } }
 * );
 *
 * // Strategic merge patch builtin resource
 * await strategicMergePatchResource(context,
 *   { type: "builtin", resourceType: "deployment", name: "my-deployment" },
 *   { spec: { replicas: 5 } }
 * );
 * ```
 */
export const strategicMergePatchResource = async (
	context: K8sContext,
	target: ResourceTarget,
	patchBody: Record<string, unknown>,
) => {
	if (target.type === "custom") {
		return await strategicMergePatchCustomResource(
			context,
			target as CustomResourceTarget,
			patchBody,
		);
	} else {
		return await strategicMergePatchBuiltinResource(
			context,
			target as BuiltinResourceTarget,
			patchBody,
		);
	}
};

/**
 * Apply resource content (JSON or YAML) automatically determining if it's builtin or custom.
 * This is a wrapper around the mutation API's applyResource function.
 *
 * @example
 * ```typescript
 * // Apply YAML content with target
 * const result = await applyResource(context,
 *   { type: "custom", resourceType: "instance", name: "my-instance" },
 *   yamlContent
 * );
 * ```
 */
export const applyResource = async (
	context: K8sContext,
	target: ResourceTarget,
	resourceContent: string | Record<string, unknown>,
) => {
	return await applyResourceMutation(context, target, resourceContent);
};

/**
 * Get pods associated with a resource.
 * This function encapsulates the logic from the pods tRPC procedure.
 *
 * @example
 * ```typescript
 * const pods = await getResourcePods(context, {
 *   type: "custom",
 *   resourceType: "devbox",
 *   name: "my-devbox"
 * });
 * ```
 */
export const getResourcePods = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	// Determine the appropriate label key based on resource type
	const labelKey = POD_LABELS[target.resourceType as keyof typeof POD_LABELS];
	if (!labelKey) {
		throw new Error(`Unknown resource type: ${target.resourceType}`);
	}

	// Get pods using the resource name and label key
	const podTarget = k8sParser.fromTypeToTarget("pod", target.name, labelKey);

	const podList = await listResources(context, podTarget);

	// Convert raw pod resources to pod objects
	return podParser.toObjects(podList.items || []);
};

/**
 * Get events for all pods associated with a resource.
 * This function encapsulates the logic from the events tRPC procedure.
 *
 * @example
 * ```typescript
 * const events = await getResourceEvents(context, {
 *   type: "custom",
 *   resourceType: "devbox",
 *   name: "my-devbox"
 * });
 * ```
 */
export const getResourceEvents = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	// Get pods associated with the resource
	const pods = await getResourcePods(context, target);

	if (pods.length === 0) {
		return {};
	}

	// Get events for each pod in parallel
	const eventsPromises = pods.map(async (pod) => {
		try {
			// Get events for this specific pod using fieldSelector
			const eventList = await getEventsByPod(context, pod.name);

			return {
				podName: pod.name,
				events: eventList.items || [],
				success: true,
			};
		} catch (error) {
			console.warn(`Failed to fetch events for pod ${pod.name}:`, error);
			return {
				podName: pod.name,
				events: [],
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

	const results = await Promise.all(eventsPromises);

	// Convert array to record format
	const eventsRecord: Record<
		string,
		{ events: unknown[]; success: boolean; error?: string }
	> = {};
	for (const result of results) {
		eventsRecord[result.podName] = {
			events: result.events,
			success: result.success,
			error: result.error,
		};
	}

	// Process events using the event parser
	return eventParser.processEventsRecord(eventsRecord);
};

/**
 * Get logs for all pods associated with a resource.
 * This function uses getResourcePods to get pods and then fetches logs for each pod.
 *
 * @example
 * ```typescript
 * const logs = await getResourceLogs(context, {
 *   type: "custom",
 *   resourceType: "devbox",
 *   name: "my-devbox"
 * });
 * ```
 */
export const getResourceLogs = async (
	context: K8sContext,
	target: ResourceTarget,
) => {
	// Get pods associated with the resource
	const pods = await getResourcePods(context, target);

	if (pods.length === 0) {
		return {};
	}

	// Get logs for each pod in parallel
	const logsPromises = pods.map(async (pod) => {
		try {
			const podTarget = {
				type: "builtin" as const,
				resourceType: "pod" as const,
				name: pod.name,
			};

			const logs = await getLogsByPod(context, podTarget);

			return {
				podName: pod.name,
				logs: logs as string,
				success: true,
			};
		} catch (error) {
			console.warn(`Failed to fetch logs for pod ${pod.name}:`, error);
			return {
				podName: pod.name,
				logs: "",
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

	const results = await Promise.all(logsPromises);

	// Convert array to record format
	const logsRecord: Record<
		string,
		{ logs: string; success: boolean; error?: string }
	> = {};
	for (const result of results) {
		logsRecord[result.podName] = {
			logs: result.logs,
			success: result.success,
			error: result.error,
		};
	}

	return logsRecord;
};

// Re-export specialized functions
export { getEventsByPod, getLogsByPod };
