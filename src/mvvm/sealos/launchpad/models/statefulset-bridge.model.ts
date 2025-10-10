import { z } from "zod";
import {
	transformConfigMap,
	transformImage,
	transformLaunchCommand,
	transformLocalStorage,
	transformOperationalStatus,
	transformPods,
	transformStatefulSetEnv,
	transformStatefulSetResource,
	transformStrategy,
} from "@/lib/launchpad/launchpad.utils";

// StatefulSet object query schema
export const StatefulsetBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "statefulset",
			path: ["metadata.name"],
		}),
	),
	image: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "statefulset",
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
				resourceType: "statefulset",
				path: ["spec"],
			}),
		)
		.transform(transformStatefulSetResource),
	status: z.any().describe(
		JSON.stringify({
			resourceType: "statefulset",
			path: [""],
		}),
	),
	strategy: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "hpa",
				path: ["spec"],
			}),
		)
		.transform(transformStrategy),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "statefulset",
				path: [""],
			}),
		)
		.transform(transformOperationalStatus),
	env: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "statefulset",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformStatefulSetEnv)
		.optional(),
	ports: z.any().optional(),
	launchCommand: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "statefulset",
				path: ["spec.template.spec.containers"],
			}),
		)
		.transform(transformLaunchCommand),
	configMap: z
		.any()
		.describe(
			JSON.stringify([
				{
					resourceType: "statefulset",
					path: ["spec.template.spec.containers"],
				},
				{
					resourceType: "configmap",
				},
			]),
		)
		.transform(transformConfigMap)
		.optional(),
	localStorage: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "pvc",
				label: "app",
			}),
		)
		.transform(transformLocalStorage)
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

export type StatefulsetObjectQuery = z.infer<typeof StatefulsetBridgeSchema>;
