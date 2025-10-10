"use server";

import type { z } from "zod";
import { INSTANCE_LABELS } from "@/constants/instance/instance-labels.constant";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import {
	getResource,
	listResources,
	selectResources,
} from "@/lib/k8s/k8s-service.api";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { K8sResourceSchema } from "@/mvvm/k8s/models/k8s-resource.model";
import { K8sResourceListSchema } from "@/mvvm/k8s/models/k8s-resource.model";
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
	context: K8sContext,
	instanceName: string,
): Promise<z.infer<typeof K8sResourceSchema>[]> => {
	// Create a ResourceTypeTarget with the instance name and label
	const resourceTypeTarget = {
		type: "custom" as const,
		resourceType: "instance" as const,
		name: instanceName,
		label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
	};

	// Use selectResources to get the specified resource types
	const selectedResources = await selectResources(
		context,
		resourceTypeTarget,
		["deployment", "statefulset"], // builtin resource types
		["devbox", "cluster", "objectstoragebucket"], // custom resource types
	);

	// Flatten and spread all resources
	const resources: z.infer<typeof K8sResourceSchema>[] = [];

	// Process each resource type
	for (const [_, resourceList] of Object.entries(selectedResources)) {
		if (resourceList) {
			// Parse and validate the resource list
			const parsedList = K8sResourceListSchema.parse(resourceList);
			resources.push(...parsedList.items);
		}
	}

	return resources;
};
