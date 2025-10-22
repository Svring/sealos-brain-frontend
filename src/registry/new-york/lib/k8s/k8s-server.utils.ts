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
import { BUILTIN_RESOURCES } from "@/registry/dark/constants/k8s/k8s-builtin.constant";
import type { BuiltinResourceConfig } from "@/registry/dark/models/k8s/k8s-builtin.model";
import type { K8sApiClients } from "@/registry/dark/models/k8s/k8s-clients.model";

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


