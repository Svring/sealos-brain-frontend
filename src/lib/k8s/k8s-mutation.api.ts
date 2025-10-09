"use server";

import type { Operation } from "fast-json-patch";
import { load } from "js-yaml";
import _ from "lodash";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import {
	escapeSlash,
	getApiClients,
	getBuiltinApiClient,
	invokeApiMethod,
} from "./k8s.utils";

/**
 * Delete a custom resource by name in Kubernetes.
 */
export const deleteCustomResource = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const { clients } = await getApiClients(context.kubeconfig);

	if (_.isNil(target.name)) {
		throw new Error("Resource name is required for deletion");
	}

	const result = await invokeApiMethod<any>(
		clients.customApi,
		"deleteNamespacedCustomObject",
		{
			group: target.group,
			version: target.version,
			namespace: context.namespace,
			plural: target.plural,
			name: target.name,
		},
	);
	return JSON.parse(JSON.stringify(result));
};

/**
 * Upsert (create or update) a custom resource in Kubernetes.
 * This is the primary method for managing custom resources - it will create if the resource doesn't exist, or update if it does.
 */
export const upsertCustomResource = 
	async (
		context: K8sContext,
		target: CustomResourceTarget,
		resourceBody: Record<string, unknown>,
	) => {
		const { clients } = await getApiClients(context.kubeconfig);

		const resourceName = (resourceBody.metadata as any)?.name || target.name;
		if (_.isNil(resourceName)) {
			throw new Error("Resource name is required in metadata or target");
		}

		try {
			// Try to get the existing resource
			await invokeApiMethod<any>(
				clients.customApi,
				"getNamespacedCustomObject",
				{
					group: target.group,
					version: target.version,
					namespace: context.namespace,
					plural: target.plural,
					name: resourceName,
				},
			);

			// If found, update it
			const result = await invokeApiMethod<any>(
				clients.customApi,
				"replaceNamespacedCustomObject",
				{
					group: target.group,
					version: target.version,
					namespace: context.namespace,
					plural: target.plural,
					name: resourceName,
					body: resourceBody,
				},
			);

			return JSON.parse(JSON.stringify(result));
		} catch (error: unknown) {
			// Assume resource doesn't exist, create it
			const result = await invokeApiMethod<any>(
				clients.customApi,
				"createNamespacedCustomObject",
				{
					group: target.group,
					version: target.version,
					namespace: context.namespace,
					plural: target.plural,
					body: resourceBody,
				},
			);

			return JSON.parse(JSON.stringify(result));
		}
	};

/**
 * Upsert (create or update) a builtin resource in Kubernetes.
 * This is the primary method for managing builtin resources - it will create if the resource doesn't exist, or update if it does.
 */
export const upsertBuiltinResource = 
	async (
		context: K8sContext,
		target: BuiltinResourceTarget,
		resourceBody: Record<string, unknown>,
	) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		const resourceName = (resourceBody.metadata as any)?.name || target.name;
		if (_.isNil(resourceName)) {
			throw new Error("Resource name is required in metadata or target");
		}

		try {
			// Try to get the existing resource
			await invokeApiMethod<any>(
				client,
				resourceConfig.getMethod,
				{
					namespace: context.namespace,
					name: resourceName,
				},
			);

			// If found, update it
			const result = await invokeApiMethod<any>(
				client,
				resourceConfig.replaceMethod,
				{
					namespace: context.namespace,
					name: resourceName,
					body: resourceBody,
				},
			);

			return JSON.parse(JSON.stringify(result));
		} catch (error: unknown) {
			// Assume resource doesn't exist, create it
			const result = await invokeApiMethod<any>(
				client,
				resourceConfig.createMethod,
				{
					namespace: context.namespace,
					body: resourceBody,
				},
			);

			return JSON.parse(JSON.stringify(result));
		}
	};

/**
 * Upsert resource content for any resource type (generic version).
 * This function parses JSON or YAML content and creates or updates the resource.
 */
export const applyResource = 
	async (
		context: K8sContext,
		resourceContent: string | Record<string, unknown>,
		target?: CustomResourceTarget | BuiltinResourceTarget,
	) => {
		// Parse resource content
		const resource =
			typeof resourceContent === "string"
				? _.attempt(JSON.parse, resourceContent) instanceof Error
					? (load(resourceContent) as Record<string, unknown>)
					: JSON.parse(resourceContent)
				: resourceContent;

		const { name } = resource.metadata as { name: string };
		if (_.isNil(name))
			throw new Error("Resource name is required in YAML metadata");

		// Handle target or infer resource type
		if (target) {
			return target.type === "custom"
				? await upsertCustomResource(context, target, resource)
				: await upsertBuiltinResource(context, target, resource);
		}

		const { apiVersion, kind } = resource as {
			apiVersion: string;
			kind: string;
		};
		if (!apiVersion || !kind) {
			throw new Error(
				"apiVersion and kind are required in YAML to infer resource type",
			);
		}

		// Handle custom or builtin resource
		if (apiVersion.includes("/")) {
			const [group, version] = apiVersion.split("/");
			return await upsertCustomResource(
				context,
				{
					type: "custom",
					resourceType: kind.toLowerCase(),
					group,
					version,
					plural: `${kind.toLowerCase()}s`,
					name,
				},
				resource,
			);
		}

		return await upsertBuiltinResource(
			context,
			{
				type: "builtin",
				resourceType: kind.toLowerCase(),
				name,
			},
			resource,
		);
	};

/**
 * Delete a builtin resource by name in Kubernetes.
 */
export const deleteBuiltinResource = 
	async (context: K8sContext, target: BuiltinResourceTarget) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for deletion");
		}

		const result = await invokeApiMethod<any>(
			client,
			resourceConfig.deleteMethod,
			{
				namespace: context.namespace,
				name: target.name,
				propagationPolicy: "Foreground",
			},
		);
		return JSON.parse(JSON.stringify(result));
	};

/**
 * Patch custom resource metadata (annotations or labels).
 */
export const patchCustomResourceMetadata = 
	async (
		context: K8sContext,
		target: CustomResourceTarget,
		metadataType: "annotations" | "labels",
		key: string,
		value: string,
	) => {
		const { clients } = await getApiClients(context.kubeconfig);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for metadata patching");
		}

		// Get current resource to check if metadata field exists
		const currentResource = await invokeApiMethod<any>(
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

		const patchBody = currentResource.metadata?.[metadataType]
			? [
					{
						op: "add",
						path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
						value,
					},
				]
			: [
					{
						op: "add",
						path: `/metadata/${metadataType}`,
						value: { [key]: value },
					},
				];

		const result = await invokeApiMethod<any>(
			clients.customApi,
			"patchNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Remove custom resource metadata (annotations or labels).
 */
export const removeCustomResourceMetadata = 
	async (
		context: K8sContext,
		target: CustomResourceTarget,
		metadataType: "annotations" | "labels",
		key: string,
	) => {
		const { clients } = await getApiClients(context.kubeconfig);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for metadata removal");
		}

		// Get current resource to check if the annotation/label exists
		const currentResource = await invokeApiMethod<any>(
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

		// Check if the metadata field and specific key exist
		const metadata = currentResource.metadata?.[metadataType];
		if (!metadata || !_.has(metadata, key)) {
			// If the annotation/label doesn't exist, return the current resource as-is
			// This prevents 422 errors when trying to remove non-existent paths
			return JSON.parse(JSON.stringify(currentResource));
		}

		const patchBody = [
			{
				op: "remove",
				path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
			},
		];

		const result = await invokeApiMethod<any>(
			clients.customApi,
			"patchNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Patch builtin resource metadata (annotations or labels).
 */
export const patchBuiltinResourceMetadata = 
	async (
		context: K8sContext,
		target: BuiltinResourceTarget,
		metadataType: "annotations" | "labels",
		key: string,
		value: string,
	) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for metadata patching");
		}

		// Get current resource to check if metadata field exists
		const currentResource = await invokeApiMethod<any>(
			client,
			resourceConfig.getMethod,
			{
				namespace: context.namespace,
				name: target.name,
			},
		);

		const patchBody = currentResource.metadata?.[metadataType]
			? [
					{
						op: "add",
						path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
						value,
					},
				]
			: [
					{
						op: "add",
						path: `/metadata/${metadataType}`,
						value: { [key]: value },
					},
				];

		const result = await invokeApiMethod<any>(
			client,
			resourceConfig.patchMethod,
			{
				namespace: context.namespace,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Remove builtin resource metadata (annotations or labels).
 */
export const removeBuiltinResourceMetadata = 
	async (
		context: K8sContext,
		target: BuiltinResourceTarget,
		metadataType: "annotations" | "labels",
		key: string,
	) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for metadata removal");
		}

		// Get current resource to check if the annotation/label exists
		const currentResource = await invokeApiMethod<any>(
			client,
			resourceConfig.getMethod,
			{
				namespace: context.namespace,
				name: target.name,
			},
		);

		// Check if the metadata field and specific key exist
		const metadata = currentResource.metadata?.[metadataType];
		if (!metadata || !_.has(metadata, key)) {
			// If the annotation/label doesn't exist, return the current resource as-is
			// This prevents 422 errors when trying to remove non-existent paths
			return JSON.parse(JSON.stringify(currentResource));
		}

		const patchBody = [
			{
				op: "remove",
				path: `/metadata/${metadataType}/${await escapeSlash(key)}`,
			},
		];

		const result = await invokeApiMethod<any>(
			client,
			resourceConfig.patchMethod,
			{
				namespace: context.namespace,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Apply YAML for instance kind custom resources.
 * This function parses YAML content and creates or updates the instance custom resource.
 */
export const applyInstanceYaml = 
	async (context: K8sContext, yamlContent: string) => {
		const { clients } = await getApiClients(context.kubeconfig);

		// Parse YAML content
		const resource = load(yamlContent) as Record<string, unknown>;
		const { name } = resource.metadata as { name: string };

		if (_.isNil(name)) {
			throw new Error("Resource name is required in YAML metadata");
		}

		try {
			// Try to get the existing resource
			await invokeApiMethod<any>(
				clients.customApi,
				"getNamespacedCustomObject",
				{
					group: "app.sealos.io",
					version: "v1",
					namespace: context.namespace,
					plural: "instances",
					name,
				},
			);

			// If found, update it
			const result = await invokeApiMethod<any>(
				clients.customApi,
				"replaceNamespacedCustomObject",
				{
					group: "app.sealos.io",
					version: "v1",
					namespace: context.namespace,
					plural: "instances",
					name,
					body: resource,
				},
			);

			return JSON.parse(JSON.stringify(result));
		} catch (error: unknown) {
			// Assume resource doesn't exist, create it
			const result = await invokeApiMethod<any>(
				clients.customApi,
				"createNamespacedCustomObject",
				{
					group: "app.sealos.io",
					version: "v1",
					namespace: context.namespace,
					plural: "instances",
					body: resource,
				},
			);

			return JSON.parse(JSON.stringify(result));
		}
	};

/**
 * Patch a custom resource with arbitrary patch operations.
 */
export const patchCustomResource = 
	async (
		context: K8sContext,
		target: CustomResourceTarget,
		patchBody: Operation[],
	) => {
		const { clients } = await getApiClients(context.kubeconfig);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for patching");
		}

		const result = await invokeApiMethod<any>(
			clients.customApi,
			"patchNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Patch a builtin resource with arbitrary patch operations.
 */
export const patchBuiltinResource = 
	async (
		context: K8sContext,
		target: BuiltinResourceTarget,
		patchBody: Operation[],
	) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for patching");
		}

		const result = await invokeApiMethod<any>(
			client,
			resourceConfig.patchMethod,
			{
				namespace: context.namespace,
				name: target.name,
				body: patchBody,
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Strategic merge patch for custom resources.
 * This allows partial updates without needing to get the full resource first.
 */
export const strategicMergePatchCustomResource = 
	async (
		context: K8sContext,
		target: CustomResourceTarget,
		patchBody: Record<string, unknown>,
	) => {
		const { clients } = await getApiClients(context.kubeconfig);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for patching");
		}

		const result = await invokeApiMethod<any>(
			clients.customApi,
			"patchNamespacedCustomObject",
			{
				group: target.group,
				version: target.version,
				namespace: context.namespace,
				plural: target.plural,
				name: target.name,
				body: patchBody,
				options: {
					headers: {
						"Content-Type": "application/strategic-merge-patch+json",
					},
				},
			},
		);

		return JSON.parse(JSON.stringify(result));
	};

/**
 * Strategic merge patch for builtin resources.
 * This allows partial updates without needing to get the full resource first.
 */
export const strategicMergePatchBuiltinResource = 
	async (
		context: K8sContext,
		target: BuiltinResourceTarget,
		patchBody: Record<string, unknown>,
	) => {
		const { client, resourceConfig } = await getBuiltinApiClient(
			context.kubeconfig,
			target.resourceType,
		);

		if (_.isNil(target.name)) {
			throw new Error("Resource name is required for patching");
		}

		const result = await invokeApiMethod<any>(
			client,
			resourceConfig.patchMethod,
			{
				namespace: context.namespace,
				name: target.name,
				body: patchBody,
				options: {
					headers: {
						"Content-Type": "application/strategic-merge-patch+json",
					},
				},
			},
		);

		return JSON.parse(JSON.stringify(result));
	};
