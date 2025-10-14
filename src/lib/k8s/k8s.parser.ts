import { BUILTIN_RESOURCES } from "@/constants/k8s/k8s-builtin.constant";
import { CUSTOM_RESOURCES } from "@/constants/k8s/k8s-custom.constant";
import type {
	BuiltinResourceTarget,
	BuiltinResourceTypeTarget,
	CustomResourceTarget,
	CustomResourceTypeTarget,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sResource } from "@/mvvm/k8s/models/k8s-resource.model";
import type { ResourceObject } from "@/mvvm/resource/models/resource-object.model";

/**
 * Convert a resource type string to a resource type target
 * @param resourceType - The resource type (e.g., "deployment", "pod", "devbox")
 * @param name - Optional resource name
 * @param label - Optional label for filtering
 * @returns Resource type target for listing resources
 */
const fromTypeToTarget = (
	resourceType: string,
	name?: string,
	label?: string,
): BuiltinResourceTypeTarget | CustomResourceTypeTarget => {
	const lowerResourceType = resourceType.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: name,
			label,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerResourceType];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: name,
			label,
		};
	}

	throw new Error(`Unknown resource type: ${resourceType}`);
};

/**
 * Convert a Kubernetes resource to a resource target
 * @param resource - The Kubernetes resource object
 * @returns Resource target for specific resource operations
 */
const fromResourceToTarget = (
	resource: K8sResource,
): BuiltinResourceTarget | CustomResourceTarget => {
	if (!resource.metadata.name) {
		throw new Error("Resource name is required");
	}

	if (!resource.kind) {
		throw new Error("Resource kind is required");
	}

	const lowerKind = resource.kind.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerKind];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: resource.metadata.name,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerKind];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: resource.metadata.name,
		};
	}

	throw new Error(`Unknown resource kind: ${resource.kind}`);
};

/**
 * Convert a K8sObject to a resource target
 * @param object - The K8sObject with name and resourceType
 * @returns Resource target for specific resource operations
 */
const fromObjectToTarget = (
	object: ResourceObject,
): BuiltinResourceTarget | CustomResourceTarget => {
	const lowerResourceType = object.resourceType.toLowerCase();

	// Check builtin resources first
	const builtinConfig = BUILTIN_RESOURCES[lowerResourceType];
	if (builtinConfig) {
		return {
			type: "builtin",
			resourceType: builtinConfig.resourceType,
			name: object.name,
		};
	}

	// Check custom resources
	const customConfig = CUSTOM_RESOURCES[lowerResourceType];
	if (customConfig) {
		return {
			type: "custom",
			resourceType: customConfig.resourceType,
			name: object.name,
		};
	}

	throw new Error(`Unknown resource type: ${object.resourceType}`);
};

export const k8sParser = {
	fromTypeToTarget,
	fromResourceToTarget,
	fromObjectToTarget,
};
