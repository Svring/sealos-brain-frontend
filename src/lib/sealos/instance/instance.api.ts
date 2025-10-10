"use server";

import { k8sParser } from "@/lib/k8s/k8s.parser";
import { getResource, listResources } from "@/lib/k8s/k8s-service.api";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";
import { InstanceResourceSchema } from "@/mvvm/sealos/instance/models/instance-resource.model";

// ============================================================================
// Instance API Functions
// ============================================================================

/**
 * List all instances
 */
export const listInstances = async (context: K8sContext) => {
	const instanceTarget = k8sParser.fromTypeToTarget("instance");
	const instanceList = await listResources(context, instanceTarget);

	// Convert raw K8s resources to instance objects using parser
	if (instanceList.items && instanceList.items.length > 0) {
		const validatedInstances = instanceList.items.map(
			(rawInstance: unknown) => {
				// Validate and parse the instance using our schema
				return InstanceResourceSchema.parse(rawInstance);
			},
		);

		// Convert to instance objects using parser
		return instanceParser.toObjects(validatedInstances);
	}

	return [];
};

/**
 * Get a specific instance by CustomResourceTarget
 */
export const getInstance = async (
	context: K8sContext,
	target: CustomResourceTarget,
): Promise<InstanceObject> => {
	const instanceResource = await getResource(context, target);

	// Validate and parse the instance using our schema
	const validatedInstance = InstanceResourceSchema.parse(instanceResource);

	// Convert to instance object using parser
	return instanceParser.toObject(validatedInstance);
};

/**
 * Get instance resources (related resources with instance label)
 */
export const getInstanceResources = async (
	_context: K8sContext,
	_instanceName: string,
) => {
	// TODO: Implement getting related resources
	// This would involve querying for resources with the instance label
	// For now, return empty arrays as placeholders
	return {
		targets: [],
		resources: [],
	};
};
