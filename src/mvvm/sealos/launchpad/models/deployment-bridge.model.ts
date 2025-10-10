import { z } from "zod";
import {
	transformConfigMap,
	transformDeploymentEnv,
	transformDeploymentResource,
	transformImage,
	transformLaunchCommand,
	transformOperationalStatus,
	transformPods,
	transformStrategy,
} from "@/lib/launchpad/launchpad.utils";

// Deployment object query schema
export const DeploymentBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "deployment",
			path: ["metadata.name"],
		}),
	),
	image: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "deployment",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "secret",
					path: ["data"],
				},
			]),
		)
		.transform(transformImage),
	resource: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec"],
			}),
		)
		.transform(transformDeploymentResource),
	strategy: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "hpa",
				path: ["spec"],
			}),
		)
		.transform(transformStrategy),
	status: z.any().describe(
		JSON.stringify({
			resourceType: "deployment",
			path: [""],
		}),
	),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: [""],
			}),
		)
		.transform(transformOperationalStatus),
	env: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformDeploymentEnv)
		.optional(),
	ports: z.any().optional(),
	launchCommand: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "deployment",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformLaunchCommand),
	configMap: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "deployment",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "configmap",
				},
			]),
		)
		.transform(transformConfigMap)
		.optional(),
	pods: z
		.any()
		.optional()
		.describe(
			JSON.stringify({
				resourceType: "pod",
				label: "app",
			}),
		)
		.transform(transformPods),
});

export type DeploymentObjectQuery = z.infer<typeof DeploymentBridgeSchema>;
