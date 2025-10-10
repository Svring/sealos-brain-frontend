import type { z } from "zod";
import { ClusterBridgeSchema } from "@/mvvm/sealos/cluster/models/cluster-bridge.model";
import { DevboxBridgeSchema } from "@/mvvm/sealos/devbox/models/devbox-bridge.model";
import { InstanceBridgeSchema } from "@/mvvm/sealos/instance/models/instance-bridge.model";
import { DeploymentBridgeSchema } from "@/mvvm/sealos/launchpad/models/deployment/deployment-bridge.model";
import { StatefulsetBridgeSchema } from "@/mvvm/sealos/launchpad/models/statefulset/statefulset-bridge.model";
import { OsbBridgeSchema } from "@/mvvm/sealos/osb/models/osb-bridge.model";

/**
 * Map of resource types to their corresponding Zod schemas
 * This allows for easy extension when adding new resource types
 */
export const RESOURCE_SCHEMA_MAP: Record<string, z.ZodObject<any>> = {
	devbox: DevboxBridgeSchema,
	cluster: ClusterBridgeSchema,
	deployment: DeploymentBridgeSchema,
	statefulset: StatefulsetBridgeSchema,
	objectstoragebucket: OsbBridgeSchema,
	instance: InstanceBridgeSchema,
	// Add more resource schemas here as they become available
	// example: "pod": PodObjectSchema,
	// example: "service": ServiceObjectSchema,
};

/**
 * Gets the schema for a given resource type
 * @param resourceType - The resource type to get schema for
 * @returns The corresponding Zod schema or null if not found
 */
export function getSchemaForResourceType(
	resourceType: string,
): z.ZodObject<any> | null {
	return RESOURCE_SCHEMA_MAP[resourceType] || null;
}

/**
 * Gets all supported resource types
 * @returns Array of supported resource type strings
 */
export function getSupportedResourceTypes(): string[] {
	return Object.keys(RESOURCE_SCHEMA_MAP);
}
