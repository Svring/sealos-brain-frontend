"use server";

import { EVENT_FIELDS } from "@/constants/event/event.constant";
import { addMissingFields } from "@/lib/k8s/k8s-client.utils";
import {
	getBuiltinApiClient,
	getCurrentNamespace,
	invokeApiMethod,
} from "@/lib/k8s/k8s-server.utils";
import { eventParser } from "@/lib/sealos/event/event.parser";
import { getResourcePods } from "@/lib/sealos/pod/pod.api";
import type { ResourceTarget } from "@/models/k8s/k8s.model";
import type { K8sContext } from "@/models/k8s/k8s-context.model";

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
 * Get events for a specific pod.
 *
 * @example
 * ```typescript
 * const podEvents = await getEventsByPod(context, "my-pod-name");
 * ```
 */
export const getEventsByPod = async (context: K8sContext, podName: string) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		"event",
	);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!namespace) {
		throw new Error("Namespace is required but not found in kubeconfig");
	}

	const eventListResponse = await invokeApiMethod<{
		items: any[];
	}>(client, resourceConfig.listMethod, {
		namespace,
		fieldSelector: `${EVENT_FIELDS.INVOLVED_OBJECT_NAME}=${podName}`,
	});

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				eventListResponse.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};
