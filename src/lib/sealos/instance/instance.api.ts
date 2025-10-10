"use server";

import _ from "lodash";
import { INSTANCE_LABELS } from "@/constants/instance/instance-labels.constant";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import {
	getResource,
	listResources,
	selectResources,
} from "@/lib/k8s/k8s-service.api";
import { clusterParser } from "@/lib/sealos/cluster/cluster.parser";
import { devboxParser } from "@/lib/sealos/devbox/devbox.parser";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import { launchpadParser } from "@/lib/sealos/launchpad/launchpad.parser";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { K8sItem } from "@/mvvm/k8s/models/k8s-resource.model";
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
): Promise<K8sItem[]> => {
	const resourceTypeTarget = {
		type: "custom" as const,
		resourceType: "instance" as const,
		name: instanceName,
		label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
	};

	const selectedResources = await selectResources(
		context,
		resourceTypeTarget,
		["deployment", "statefulset"],
		["devbox", "cluster", "objectstoragebucket"],
	);

	const parsers: Record<string, (resource: any) => K8sItem> = {
		Devbox: devboxParser.toItem,
		Cluster: clusterParser.toItem,
		Deployment: launchpadParser.toItem,
		StatefulSet: launchpadParser.toItem,
	};

	return _.flatMap(_.pickBy(selectedResources, Boolean), (resourceList) =>
		K8sResourceListSchema.parse(resourceList)
			.items.map((resource) => {
				const parser = parsers[resource.kind];
				if (!parser) return null;
				try {
					return parser(resource);
				} catch (error) {
					console.warn(`Failed to parse resource ${resource.kind}:`, error);
					return null;
				}
			})
			.filter(Boolean),
	) as K8sItem[];
};
