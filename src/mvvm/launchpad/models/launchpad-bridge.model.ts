import { z } from "zod";
import { DeploymentBridgeSchema } from "./deployment-bridge.model";
import { StatefulsetBridgeSchema } from "./statefulset-bridge.model";

// Unified launchpad object query schema (discriminated union)
export const LaunchpadObjectQuerySchema = z.discriminatedUnion("kind", [
	DeploymentBridgeSchema.extend({
		kind: z.literal("Deployment"),
	}),
	StatefulsetBridgeSchema.extend({
		kind: z.literal("StatefulSet"),
	}),
]);

// Re-export schemas and types from individual bridge models
export { DeploymentBridgeSchema as DeploymentObjectQuerySchema } from "./deployment-bridge.model";
export { StatefulsetBridgeSchema as StatefulsetObjectQuerySchema } from "./statefulset-bridge.model";

export type DeploymentObjectQuery = z.infer<typeof DeploymentBridgeSchema>;
export type StatefulsetObjectQuery = z.infer<
	typeof StatefulsetBridgeSchema
>;
export type LaunchpadObjectQuery = z.infer<typeof LaunchpadObjectQuerySchema>;
