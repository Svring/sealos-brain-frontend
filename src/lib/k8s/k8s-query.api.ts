"use server";

import { EVENT_FIELDS } from "@/constants/event/event.constant";
import { CUSTOM_RESOURCES } from "@/constants/k8s/k8s-custom.constant";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import {
	getApiClients,
	getBuiltinApiClient,
	getCurrentNamespace,
	invokeApiMethod,
} from "./k8s-server.utils";

// ============================================================================
// Kubernetes API Query Functions
// ============================================================================

export const listCustomResources = async (
	context: K8sContext,
	target: CustomResourceTypeTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceConfig = CUSTOM_RESOURCES[target.resourceType];
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!customResourceConfig) {
		throw new Error(`Unknown custom resource type: ${target.resourceType}`);
	}

	const customResourceListResponse = await invokeApiMethod(
		clients.customApi,
		"listNamespacedCustomObject",
		{
			group: customResourceConfig.group,
			version: customResourceConfig.version,
			namespace: namespace || "default",
			plural: customResourceConfig.plural,
			labelSelector:
				target.label && target.name
					? `${target.label}=${target.name}`
					: undefined,
		},
	);
	return JSON.parse(JSON.stringify(customResourceListResponse));
};

export const getCustomResource = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceConfig = CUSTOM_RESOURCES[target.resourceType];
	const namespace = await getCurrentNamespace(context.kubeconfig);

	if (!customResourceConfig) {
		throw new Error(`Unknown custom resource type: ${target.resourceType}`);
	}

	const customResourceGetResponse = await invokeApiMethod(
		clients.customApi,
		"getNamespacedCustomObject",
		{
			group: customResourceConfig.group,
			version: customResourceConfig.version,
			namespace: namespace || "default",
			plural: customResourceConfig.plural,
			name: target.name,
		},
	);
	return JSON.parse(JSON.stringify(customResourceGetResponse));
};

export const listBuiltinResources = async (
	context: K8sContext,
	target: BuiltinResourceTypeTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	const builtinResourceListResponse = await invokeApiMethod(
		client,
		resourceConfig.listMethod,
		{
			namespace: namespace || "default",
			labelSelector:
				target.label && target.name
					? `${target.label}=${target.name}`
					: undefined,
		},
	);

	return JSON.parse(JSON.stringify(builtinResourceListResponse));
};

export const getBuiltinResource = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	const builtinResourceGetResponse = await invokeApiMethod(
		client,
		resourceConfig.getMethod,
		{
			namespace: namespace || "default",
			name: target.name,
		},
	);

	return JSON.parse(JSON.stringify(builtinResourceGetResponse));
};

/**
 * Get logs for a specific pod.
 *
 * @example
 * ```typescript
 * const podLogs = await getLogsByPod(context, { type: "builtin", resourceType: "pod", name: "my-pod-name" });
 * ```
 */
export const getLogsByPod = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const namespace = await getCurrentNamespace(context.kubeconfig);

	const logResponse = await invokeApiMethod(
		clients.coreApi,
		"readNamespacedPodLog",
		{
			namespace: namespace || "default",
			name: target.name,
		},
	);

	return logResponse;
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

	const eventListResponse = await invokeApiMethod(
		client,
		resourceConfig.listMethod,
		{
			namespace: namespace || "default",
			fieldSelector: `${EVENT_FIELDS.INVOLVED_OBJECT_NAME}=${podName}`,
		},
	);

	return JSON.parse(JSON.stringify(eventListResponse));
};
