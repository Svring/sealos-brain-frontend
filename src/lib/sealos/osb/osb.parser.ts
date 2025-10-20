import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import { OsbObjectSchema, type OsbObject } from "@/mvvm/sealos/osb/models/osb-object.model";
import type { ObjectStorageBucketResource } from "@/mvvm/sealos/osb/models/osb-resource.model";
import { ObjectStorageBucketResourceSchema } from "@/mvvm/sealos/osb/models/osb-resource.model";

export interface OsbItem extends Record<string, unknown> {
	name: string;
	uid: string;
	resourceType: "objectstoragebucket";
	displayName: string;
	policy: string;
}

/**
 * Convert ObjectStorageBucketResource to OsbItem
 */
const toItem = (resource: ObjectStorageBucketResource): OsbItem => {
	const { metadata, spec } = resource;

	// Get display name from annotations or fallback to name
	const displayName =
		metadata.annotations?.["sealos.io/display-name"] || metadata.name;

	return {
		name: metadata.name,
		uid: metadata.uid || "",
		resourceType: "objectstoragebucket",
		displayName,
		policy: spec.policy,
	};
};

/**
 * Convert ObjectStorageBucketResource, OsbObject, or string to target for API operations
 */
const toTarget = (input: ObjectStorageBucketResource | OsbObject | string): CustomResourceTarget => {
	let name: string;
	
	if (typeof input === "string") {
		name = input;
	} else if ("metadata" in input) {
		// ObjectStorageBucketResource
		name = input.metadata.name;
	} else {
		// OsbObject
		name = input.name;
	}
	
	return {
		type: "custom",
		resourceType: "objectstoragebucket",
		name,
	};
};

/**
 * Convert array of ObjectStorageBucketResource to items
 */
const toItems = (resources: ObjectStorageBucketResource[]): OsbItem[] => {
	return resources.map(toItem);
};

/**
 * Convert array of ObjectStorageBucketResource to targets
 */
const toTargets = (resources: ObjectStorageBucketResource[]): CustomResourceTarget[] => {
	return resources.map(toTarget);
};

/**
 * Safely parse and convert unknown input to OsbItem
 */
const parseToItem = (input: unknown): OsbItem | null => {
	try {
		// Try to parse as ObjectStorageBucketResource first
		const resourceResult = ObjectStorageBucketResourceSchema.safeParse(input);
		if (resourceResult.success) {
			return toItem(resourceResult.data);
		}

		// Try to parse as OsbObject
		const objectResult = OsbObjectSchema.safeParse(input);
		if (objectResult.success) {
			const obj = objectResult.data;
			return {
				name: obj.name,
				uid: obj.uid,
				resourceType: "objectstoragebucket",
				displayName: obj.displayName,
				policy: obj.policy,
			};
		}

		return null;
	} catch {
		return null;
	}
};

/**
 * Safely parse and convert unknown input to target
 */
const parseToTarget = (input: unknown): CustomResourceTarget | null => {
	try {
		const resourceResult = ObjectStorageBucketResourceSchema.safeParse(input);
		if (resourceResult.success) {
			return toTarget(resourceResult.data);
		}
		return null;
	} catch {
		return null;
	}
};

export const osbParser = {
	toItem,
	toTarget,
	toItems,
	toTargets,
	parseToItem,
	parseToTarget,
};
