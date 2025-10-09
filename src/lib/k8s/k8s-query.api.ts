"use server";

import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import {
	addMissingFields,
	getApiClients,
	getBuiltinApiClient,
	invokeApiMethod,
} from "./k8s.utils";

// ============================================================================
// Direct helpers (no Server Action wrapper)
// Use these from server-only contexts (e.g., tRPC) to avoid spawning
// multiple Server Action HTTP requests.
// ============================================================================

export const listCustomResourcesDirect = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceListResponse =
		await invokeApiMethod<any>(
			clients.customApi,
			"listNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				labelSelector: target.labelSelector,
			},
		);
	return JSON.parse(JSON.stringify(customResourceListResponse));
};

export const getCustomResourceDirect = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceGetResponse =
		await invokeApiMethod<any>(
			clients.customApi,
			"getNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
			},
		);
	return JSON.parse(JSON.stringify(customResourceGetResponse));
};

export const listBuiltinResourcesDirect = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);

	const builtinResourceListResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.listMethod,
			{
				namespace: context.namespace,
				labelSelector: target.labelSelector,
			},
		);

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				builtinResourceListResponse.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};

export const getBuiltinResourceDirect = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);

	const builtinResourceGetResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.getMethod,
			{
				namespace: context.namespace,
				name: target.name,
			},
		);

	return JSON.parse(JSON.stringify(builtinResourceGetResponse));
};

export const getResourceByOwnerDirect = async (
	context: K8sContext,
	resourceType: string,
	ownerKind: string,
	ownerName: string,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		resourceType,
	);

	const resourceListResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.listMethod,
			{
				namespace: context.namespace,
			},
		);

	const filteredResources = resourceListResponse.items.filter(
		(resource: any) => {
			if (!resource.metadata?.ownerReferences) return false;
			return resource.metadata.ownerReferences.some(
				(owner: any) => owner.kind === ownerKind && owner.name === ownerName,
			);
		},
	);

	const result = {
		...resourceListResponse,
		items: filteredResources,
	};

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				result.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};

/**
 * List events in Kubernetes (direct version for server-side use).
 * Use this from server-only contexts (e.g., tRPC) to avoid spawning
 * multiple Server Action HTTP requests.
 *
 * @example
 * ```typescript
 * const events = await listEventsDirect(context, {
 *   type: "builtin",
 *   resourceType: "event",
 *   labelSelector: "app=my-app"
 * });
 * ```
 */
export const listEventsDirect = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	return listBuiltinResourcesDirect(context, target);
};

/**
 * Get events for a specific pod (direct version for server-side use).
 * Use this from server-only contexts (e.g., tRPC) to avoid spawning
 * multiple Server Action HTTP requests.
 *
 * @example
 * ```typescript
 * const podEvents = await getEventsByPodDirect(context, "my-pod-name");
 * ```
 */
export const getEventsByPodDirect = async (
	context: K8sContext,
	podName: string,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		"event",
	);

	const eventListResponse = await invokeApiMethod<any>(
		client,
		resourceConfig.listMethod,
		{
			namespace: context.namespace,
			fieldSelector: `involvedObject.name=${podName}`,
		},
	);

	// console.log("eventListResponse", eventListResponse);

	return await addMissingFields(
		eventListResponse.items,
		resourceConfig.apiVersion,
		resourceConfig.kind,
	);
};

/**
 * Get logs for a specific pod (direct version for server-side use).
 * Use this from server-only contexts (e.g., tRPC) to avoid spawning
 * multiple Server Action HTTP requests.
 *
 * @example
 * ```typescript
 * const podLogs = await getPodLogsDirect(context, "my-pod-name", {
 *   container: "main",
 *   tailLines: 100,
 *   follow: false
 * });
 * ```
 */
export const getPodLogsDirect = async (
	context: K8sContext,
	podName: string,
	options: {
		container?: string;
		tailLines?: number;
		follow?: boolean;
		previous?: boolean;
		sinceSeconds?: number;
		timestamps?: boolean;
	} = {},
) => {
	const { clients } = await getApiClients(context.kubeconfig);

	const logResponse = await invokeApiMethod<string>(
		clients.coreApi,
		"readNamespacedPodLog",
		{
			namespace: context.namespace,
			name: podName,
			container: options.container,
			tailLines: options.tailLines,
			follow: options.follow || false,
			previous: options.previous || false,
			sinceSeconds: options.sinceSeconds,
			timestamps: options.timestamps || false,
		},
	);

	return logResponse;
};

/**
 * List custom resources in Kubernetes.
 */
export const listCustomResources = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceListResponse =
		await invokeApiMethod<any>(
			clients.customApi,
			"listNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				labelSelector: target.labelSelector,
			},
		);
	return JSON.parse(JSON.stringify(customResourceListResponse));
};

/**
 * Get a custom resource by name in Kubernetes.
 */
export const getCustomResource = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);
	const customResourceGetResponse =
		await invokeApiMethod<any>(
			clients.customApi,
			"getNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
			},
		);
	return JSON.parse(JSON.stringify(customResourceGetResponse));
};

/**
 * List builtin Kubernetes resources dynamically based on resource type.
 */
export const listBuiltinResources = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);

	const builtinResourceListResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.listMethod,
			{
				namespace: context.namespace,
				labelSelector: target.labelSelector,
			},
		);

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				builtinResourceListResponse.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};

/**
 * Get a builtin Kubernetes resource by name dynamically based on resource type.
 */
export const getBuiltinResource = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		target.resourceType,
	);

	const builtinResourceGetResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.getMethod,
			{
				namespace: context.namespace,
				name: target.name,
			},
		);

	return JSON.parse(JSON.stringify(builtinResourceGetResponse));
};

/**
 * Get resources owned by a specific resource (filtered by ownerReferences).
 */
export const getResourceByOwner = async (
	context: K8sContext,
	resourceType: string,
	ownerKind: string,
	ownerName: string,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		resourceType,
	);

	const resourceListResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.listMethod,
			{
				namespace: context.namespace,
			},
		);

	// Filter resources by ownerReferences
	const filteredResources = resourceListResponse.items.filter(
		(resource: any) => {
			if (!resource.metadata?.ownerReferences) return false;
			return resource.metadata.ownerReferences.some(
				(owner: any) => owner.kind === ownerKind && owner.name === ownerName,
			);
		},
	);

	const result = {
		...resourceListResponse,
		items: filteredResources,
	};

	return JSON.parse(
		JSON.stringify(
			await addMissingFields(
				result.items,
				resourceConfig.apiVersion,
				resourceConfig.kind,
			),
		),
	);
};

/**
 * List events in Kubernetes.
 *
 * @example
 * ```typescript
 * const events = await listEvents(context, {
 *   type: "builtin",
 *   resourceType: "event",
 *   labelSelector: "app=my-app"
 * });
 * ```
 */
export const listEvents = async (
	context: K8sContext,
	target: BuiltinResourceTarget,
) => {
	return listBuiltinResources(context, target);
};

/**
 * Get events for a specific pod.
 *
 * @example
 * ```typescript
 * const podEvents = await getEventsByPod(context, "my-pod-name");
 * ```
 */
export const getEventsByPod = async (
	context: K8sContext,
	podName: string,
) => {
	const { client, resourceConfig } = await getBuiltinApiClient(
		context.kubeconfig,
		"event",
	);

	const eventListResponse =
		await invokeApiMethod<any>(
			client,
			resourceConfig.listMethod,
			{
				namespace: context.namespace,
				fieldSelector: `involvedObject.name=${podName}`,
			},
		);

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

/**
 * Get logs for a specific pod.
 *
 * @example
 * ```typescript
 * const podLogs = await getPodLogs(context, "my-pod-name", {
 *   container: "main",
 *   tailLines: 100,
 *   follow: false
 * });
 * ```
 */
export const getPodLogs = async (
	context: K8sContext,
	podName: string,
	options: {
		container?: string;
		tailLines?: number;
		follow?: boolean;
		previous?: boolean;
		sinceSeconds?: number;
		timestamps?: boolean;
	} = {},
) => {
	const { clients } = await getApiClients(context.kubeconfig);

	const logResponse = await invokeApiMethod<string>(
		clients.coreApi,
		"readNamespacedPodLog",
		{
			namespace: context.namespace,
			name: podName,
			container: options.container,
			tailLines: options.tailLines,
			follow: options.follow || false,
			previous: options.previous || false,
			sinceSeconds: options.sinceSeconds,
			timestamps: options.timestamps || false,
		},
	);

	return logResponse;
};
