import { BUILTIN_RESOURCES } from "@/constants/k8s/k8s-builtin.constant";
import { CUSTOM_RESOURCES } from "@/constants/k8s/k8s-custom.constant";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import { osbParser } from "@/lib/sealos/osb/osb.parser";
import type {
	ResourceTarget,
	ResourceTypeTarget,
} from "@/mvvm/k8s/models/k8s.model";
import { BuiltinResourceTargetSchema } from "@/mvvm/k8s/models/k8s-builtin.model";
import { CustomResourceTargetSchema } from "@/mvvm/k8s/models/k8s-custom.model";
import type {
	K8sItem,
	K8sResource,
} from "@/mvvm/k8s/models/k8s-resource.model";
import {
	K8sItemSchema,
	K8sResourceSchema,
} from "@/mvvm/k8s/models/k8s-resource.model";
import {
	type ResourceObject,
	ResourceObjectSchema,
} from "@/mvvm/resource/models/resource-object.model";

/**
 * Safely parse and determine resource type
 */
const parseResource = (
	input: unknown,
): {
	name: string;
	kind: string;
	type: "resource" | "item" | "object" | "target";
} => {
	// Try to parse as BuiltinResourceTarget first
	const builtinTargetResult = BuiltinResourceTargetSchema.safeParse(input);
	if (builtinTargetResult.success) {
		const target = builtinTargetResult.data;
		return {
			name: target.name,
			kind: target.resourceType.toLowerCase(),
			type: "target",
		};
	}

	// Try to parse as CustomResourceTarget
	const customTargetResult = CustomResourceTargetSchema.safeParse(input);
	if (customTargetResult.success) {
		const target = customTargetResult.data;
		return {
			name: target.name,
			kind: target.resourceType.toLowerCase(),
			type: "target",
		};
	}

	// Try to parse as K8sResource
	const resourceResult = K8sResourceSchema.safeParse(input);
	if (resourceResult.success) {
		const resource = resourceResult.data;
		return {
			name: resource.metadata.name,
			kind: resource.kind.toLowerCase(),
			type: "resource",
		};
	}

	// Try to parse as K8sItem
	const itemResult = K8sItemSchema.safeParse(input);
	if (itemResult.success) {
		const item = itemResult.data;
		return {
			name: item.name,
			kind: item.resourceType.toLowerCase(),
			type: "item",
		};
	}

	// Try to parse as ResourceObject
	const objectResult = ResourceObjectSchema.safeParse(input);
	if (objectResult.success) {
		const object = objectResult.data;
		return {
			name: object.name,
			kind: object.resourceType.toLowerCase(),
			type: "object",
		};
	}

	throw new Error(`Invalid resource format: ${JSON.stringify(input)}`);
};

/**
 * Convert K8s resource(s) to target for API operations
 * Delegates to specific parsers based on resource type
 */
const toTarget = (resource: unknown): ResourceTarget => {
	const { kind, type } = parseResource(resource);

	// If input is already a target, return it as-is
	if (type === "target") {
		return resource as ResourceTarget;
	}

	const k8sResource = resource as K8sResource;

	// Try specific parsers first
	try {
		switch (kind) {
			case "cluster":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return clusterParser.toTarget(k8sResource);
			case "devbox":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return devboxParser.toTarget(k8sResource);
			case "instance":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return instanceParser.toTarget(k8sResource);
			case "objectstoragebucket":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return osbParser.toTarget(k8sResource);
			case "deployment":
			case "statefulset":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return launchpadParser.toTarget(k8sResource);
		}
	} catch {
		// Fall through to generic handling
	}

	// Generic handling for other resource types
	const { name } = parseResource(resource);

	if (!name) throw new Error("Resource name is required");
	if (!kind) throw new Error("Resource kind/type is required");

	// Check builtin first
	const builtin = BUILTIN_RESOURCES[kind];
	if (builtin) {
		return { type: "builtin", resourceType: builtin.resourceType, name };
	}

	// Check custom
	const custom = CUSTOM_RESOURCES[kind];
	if (custom) {
		return { type: "custom", resourceType: custom.resourceType, name };
	}

	throw new Error(`Unknown resource type: ${kind}`);
};

/**
 * Convert resource type to target for listing operations
 */
const toTypeTarget = (
	resourceType: string,
	name?: string,
	label?: string,
): ResourceTypeTarget => {
	const type = resourceType.toLowerCase();

	// Check builtin first
	const builtin = BUILTIN_RESOURCES[type];
	if (builtin) {
		return { type: "builtin", resourceType: builtin.resourceType, name, label };
	}

	// Check custom
	const custom = CUSTOM_RESOURCES[type];
	if (custom) {
		return { type: "custom", resourceType: custom.resourceType, name, label };
	}

	throw new Error(`Unknown resource type: ${resourceType}`);
};

/**
 * Convert K8s resource to item (minimal representation)
 * Delegates to specific parsers based on resource type
 */
const toItem = (resource: unknown): K8sItem => {
	const { type, kind } = parseResource(resource);

	if (type === "item") {
		// Already an item, return as-is
		return resource as K8sItem;
	}

	if (type === "object") {
		// Convert ResourceObject to K8sItem
		const object = resource as ResourceObject;
		return {
			name: object.name,
			uid: "", // ResourceObject doesn't have uid
			resourceType: object.resourceType.toLowerCase(),
		};
	}

	// Try specific parsers first
	const k8sResource = resource as K8sResource;
	try {
		switch (kind) {
			case "cluster":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return clusterParser.toItem(k8sResource);
			case "devbox":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return devboxParser.toItem(k8sResource);
			case "objectstoragebucket":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return osbParser.toItem(k8sResource);
			case "deployment":
			case "statefulset":
				// @ts-expect-error - K8sResource is generic, specific parser handles validation
				return launchpadParser.toItem(k8sResource);
		}
	} catch {
		// Fall through to generic handling
	}

	// Generic handling for other resource types
	return {
		name: k8sResource.metadata.name || "unknown",
		uid: k8sResource.metadata.uid || "",
		resourceType: k8sResource.kind?.toLowerCase() || "unknown",
	};
};

/**
 * Convert array of K8s resources to items
 */
const toItems = (resources: unknown[]): K8sItem[] => {
	return resources
		.map((resource) => {
			try {
				return toItem(resource);
			} catch {
				return null;
			}
		})
		.filter(
			(item): item is K8sItem => item !== null && item.name !== "unknown",
		);
};

/**
 * Convert array of K8s resources/items to targets
 */
const toTargets = (resources: unknown[]): ResourceTarget[] => {
	return resources
		.map((resource) => {
			try {
				return toTarget(resource);
			} catch {
				return null;
			}
		})
		.filter((target): target is ResourceTarget => target !== null);
};

export const resourceParser = {
	toTarget,
	toTypeTarget,
	toItem,
	toItems,
	toTargets,
};
