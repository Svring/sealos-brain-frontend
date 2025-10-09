"use server";

import {
	AppsV1Api,
	AutoscalingV2Api,
	BatchV1Api,
	CoreV1Api,
	CustomObjectsApi,
	KubeConfig,
	NetworkingV1Api,
	RbacAuthorizationV1Api,
} from "@kubernetes/client-node";
import _ from "lodash";
import { BUILTIN_RESOURCES } from "@/constants/k8s/k8s-builtin.constant";
import type { BuiltinResourceConfig } from "@/mvvm/k8s/models/k8s-builtin.model";
import type { K8sApiClients } from "@/mvvm/k8s/models/k8s-clients.model";

/**
 * Get the current namespace from a kubeconfig string.
 * @param kubeconfig - The kubeconfig string.
 * @returns The current namespace, or 'default' if not set.
 */
export async function getCurrentNamespace(
	kubeconfig: string,
): Promise<string | undefined> {
	const kc = new KubeConfig();
	kc.loadFromString(kubeconfig);
	const currentContext = kc.getCurrentContext();
	const contextObj = kc.getContextObject(currentContext);
	return contextObj?.namespace;
}

/**
 * Extract the region URL from a kubeconfig string.
 * @param kubeconfig - The kubeconfig string.
 * @returns The region URL (hostname without port), or undefined if not found.
 * @example
 * // For server: "https://bja.sealos.run:6443"
 * // Returns: "bja.sealos.run"
 */
export async function getRegionUrlFromKubeconfig(
	kubeconfig: string,
): Promise<string | undefined> {
	try {
		const kc = new KubeConfig();
		kc.loadFromString(kubeconfig);

		const currentContext = kc.getCurrentContext();
		const contextObj = kc.getContextObject(currentContext);

		if (!contextObj?.cluster) {
			return undefined;
		}

		const clusterObj = kc.getCluster(contextObj.cluster);
		if (!clusterObj?.server) {
			return undefined;
		}

		// Parse the server URL to extract hostname
		const url = new URL(clusterObj.server);
		return url.hostname;
	} catch (error) {
		console.error("Failed to extract region URL from kubeconfig:", error);
		return undefined;
	}
}

/**
 * Helper to add missing apiVersion and kind to builtin resource lists.
 */
export async function addMissingFields<T extends Record<string, unknown>>(
	items: T[],
	apiVersion: string,
	kind: string,
): Promise<{
	apiVersion: string;
	kind: string;
	items: T[];
}> {
	await new Promise((resolve) => setTimeout(resolve, 0));
	return {
		apiVersion: `${apiVersion}List`,
		kind: `${kind}List`,
		items: items.map((item) => ({
			apiVersion,
			kind,
			...item,
		})),
	};
}

const clientCache: Record<string, { kc: KubeConfig; clients: K8sApiClients }> =
	{};

export async function getApiClients(
	kubeconfig: string,
): Promise<{ kc: KubeConfig; clients: K8sApiClients }> {
	if (_.has(clientCache, kubeconfig)) {
		return _.get(clientCache, kubeconfig);
	}
	const kc = new KubeConfig();
	kc.loadFromString(kubeconfig);
	const clients: K8sApiClients = {
		customApi: kc.makeApiClient(CustomObjectsApi),
		appsApi: kc.makeApiClient(AppsV1Api),
		autoscalingApi: kc.makeApiClient(AutoscalingV2Api),
		batchApi: kc.makeApiClient(BatchV1Api),
		coreApi: kc.makeApiClient(CoreV1Api),
		networkingApi: kc.makeApiClient(NetworkingV1Api),
		rbacApi: kc.makeApiClient(RbacAuthorizationV1Api),
	};
	_.set(clientCache, kubeconfig, { kc, clients });
	return { kc, clients };
}

/**
 * Type-safe method invoker for API clients
 */
export async function invokeApiMethod<T>(
	client: K8sApiClients[keyof K8sApiClients],
	methodName: string,
	params: Record<string, unknown> | unknown[] = {},
): Promise<T> {
	if (!_.isObject(client)) {
		throw new Error("Client must be a valid API client object");
	}
	if (!_.isString(methodName) || _.isEmpty(methodName)) {
		throw new Error("Method name must be a non-empty string");
	}
	if (!_.isObject(params) && !_.isArray(params)) {
		throw new Error("Params must be an object or array");
	}

	const method = _.get(client, methodName);
	if (!_.isFunction(method)) {
		throw new Error(
			`Method ${methodName} not found or not a function on client: ${JSON.stringify(
				client,
			)}`,
		);
	}

	const args = _.isArray(params) ? params : [params];

	const result = await _.attempt(async () => method.call(client, ...args));
	if (_.isError(result)) {
		// Handle 404 errors for delete operations - treat as successful since the resource is already gone
		if (
			methodName.toLowerCase().includes("delete") &&
			(result.message.includes("404") ||
				result.message.includes("HTTP-Code: 404") ||
				result.message.includes("not found"))
		) {
			return {} as T;
		}
		throw new Error(`Failed to invoke ${methodName}: ${result.message}`);
	}

	return result as T;
}

/**
 * Get the correct API client for a builtin resource type, given kubeconfig and resourceType.
 */
export async function getBuiltinApiClient(
	kubeconfig: string,
	resourceType: string,
): Promise<{
	client: K8sApiClients[keyof K8sApiClients];
	resourceConfig: BuiltinResourceConfig;
}> {
	const { clients } = await getApiClients(kubeconfig);
	const resourceConfig = BUILTIN_RESOURCES[
		resourceType
	] as BuiltinResourceConfig;
	if (_.isNil(resourceConfig)) {
		throw new Error(`Unknown builtin resource type: ${resourceType}`);
	}
	return {
		client: clients[resourceConfig.apiClient as keyof K8sApiClients],
		resourceConfig,
	};
}

/**
 * Helper function to escape slashes in keys for JSON Patch paths
 */
export async function escapeSlash(key: string): Promise<string> {
	return key.replace(/\//g, "~1");
}

/**
 * Convert Kubernetes resource quantity string to universal units
 * @param quantity - Kubernetes resource quantity string (e.g., "64", "20200m", "96Gi", "25828Mi")
 * @param resourceType - Type of resource ("cpu", "memory", "storage", or "other")
 * @returns Converted numeric value in universal units (cores for CPU, GB for memory/storage, raw number for others)
 */
export function convertK8sQuantityToUniversalUnit(
	quantity: string,
	resourceType: "cpu" | "memory" | "storage" | "other" = "other"
): number {
	if (!quantity || typeof quantity !== "string") {
		return 0;
	}

	// Handle CPU resources
	if (resourceType === "cpu") {
		if (quantity.endsWith("m")) {
			// Convert millicores to cores (e.g., "20200m" -> 20.2)
			return parseFloat(quantity.slice(0, -1)) / 1000;
		} else {
			// Direct cores (e.g., "64" -> 64)
			return parseFloat(quantity);
		}
	}

	// Handle memory and storage resources
	if (resourceType === "memory" || resourceType === "storage") {
		if (quantity.endsWith("Gi")) {
			// Convert GiB to GB (e.g., "96Gi" -> 96)
			return parseFloat(quantity.slice(0, -2));
		} else if (quantity.endsWith("Mi")) {
			// Convert MiB to GB (e.g., "25828Mi" -> 25.828)
			return parseFloat(quantity.slice(0, -2)) / 1024;
		} else if (quantity.endsWith("Ki")) {
			// Convert KiB to GB (e.g., "1048576Ki" -> 1)
			return parseFloat(quantity.slice(0, -2)) / (1024 * 1024);
		} else if (quantity.endsWith("G")) {
			// Direct GB (e.g., "100G" -> 100)
			return parseFloat(quantity.slice(0, -1));
		} else if (quantity.endsWith("M")) {
			// Convert MB to GB (e.g., "1000M" -> 1)
			return parseFloat(quantity.slice(0, -1)) / 1000;
		} else if (quantity.endsWith("K")) {
			// Convert KB to GB (e.g., "1000000K" -> 0.001)
			return parseFloat(quantity.slice(0, -1)) / (1000 * 1000);
		} else {
			// Assume bytes and convert to GB
			return parseFloat(quantity) / (1024 * 1024 * 1024);
		}
	}

	// Handle other resources (counts, custom resources, etc.)
	return parseFloat(quantity) || 0;
}
