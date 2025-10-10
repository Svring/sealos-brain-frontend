import { z } from "zod";
import { formatDurationToReadable, formatIsoDateToReadable } from "@/lib/date/date-utils";
import { convertK8sQuantityToUniversalUnit } from "@/lib/k8s/k8s-client.utils";
import type { K8sResource } from "@/mvvm/k8s/models/k8s-resource.model";
import type { ClusterResource, ComponentSpec } from "./cluster-resource.model";

export const ClusterBridgeSchema = z.object({
	name: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["metadata.name"],
		}),
	),
	type: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.clusterDefinitionRef"],
		}),
	),
	version: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.clusterVersionRef"],
		}),
	),
	status: z
		.any()
		.nullable()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: ["status.phase"],
			}),
		),
	resource: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: ["spec.componentSpecs"],
			}),
		)
		.transform((data) => {
			// Convert Kubernetes resource strings to universal units
			const cpu = convertK8sQuantityToUniversalUnit(
				data.cpu || "0",
				"cpu",
			);
			const memory = convertK8sQuantityToUniversalUnit(
				data.memory || "0",
				"memory",
			);
			const storage = convertK8sQuantityToUniversalUnit(
				data.storage || "0",
				"storage",
			);

			return {
				cpu,
				memory,
				storage,
				replicas: data.replicas || 1,
			};
		}),
	operationalStatus: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: [""],
			}),
		)
		.transform((resource) => {
			const metadata = resource.metadata;
			const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

			return {
				createdAt,
			};
		}),
	components: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "cluster",
				path: [""],
			}),
		)
		.transform((resource: ClusterResource) => {
			const componentSpecs = resource.spec.componentSpecs;
			const statusComponents = resource.status?.components;
			if (!Array.isArray(componentSpecs)) return [];

			return componentSpecs.map((spec: ComponentSpec) => {
				const cpu = convertK8sQuantityToUniversalUnit(
					spec.resources?.limits?.cpu || spec.resources?.requests?.cpu || "0",
					"cpu",
				);
				const memory = convertK8sQuantityToUniversalUnit(
					spec.resources?.limits?.memory ||
						spec.resources?.requests?.memory ||
						"0",
					"memory",
				);
				const storage = convertK8sQuantityToUniversalUnit(
					spec.volumeClaimTemplates?.[0]?.spec?.resources?.requests?.storage ||
						"0",
					"storage",
				);

				return {
					name: spec.name,
					status: statusComponents?.[spec.name]?.phase || "unknown",
					resource: {
						cpu,
						memory,
						storage,
						replicas: spec.replicas || 0,
					},
				};
			});
		}),
	connection: z.object({
		privateConnection: z.object({
			endpoint: z
				.any()
				.nullable()
				.describe(
					JSON.stringify({
						resourceType: "secret",
						label: "app.kubernetes.io/instance",
						name: "{{instanceName}}-conn-credential$",
						path: ["data.endpoint"],
					}),
				)
				.transform((val) =>
					val ? Buffer.from(val, "base64").toString("utf-8") : null,
				),
			host: z
				.any()
				.nullable()
				.describe(
					JSON.stringify({
						resourceType: "secret",
						label: "app.kubernetes.io/instance",
						name: "^{{instanceName}}-conn-credential$",
						path: ["data.host"],
					}),
				)
				.transform((val) =>
					val ? Buffer.from(val, "base64").toString("utf-8") : null,
				),
			port: z
				.any()
				.nullable()
				.describe(
					JSON.stringify({
						resourceType: "secret",
						label: "app.kubernetes.io/instance",
						name: "^{{instanceName}}-conn-credential$",
						path: ["data.port"],
					}),
				)
				.transform((val) =>
					val ? Buffer.from(val, "base64").toString("utf-8") : null,
				),
			username: z
				.any()
				.nullable()
				.describe(
					JSON.stringify({
						resourceType: "secret",
						label: "app.kubernetes.io/instance",
						name: "^{{instanceName}}-conn-credential$",
						path: ["data.username"],
					}),
				)
				.transform((val) =>
					val ? Buffer.from(val, "base64").toString("utf-8") : null,
				),
			password: z
				.any()
				.nullable()
				.describe(
					JSON.stringify({
						resourceType: "secret",
						label: "app.kubernetes.io/instance",
						name: "^{{instanceName}}-conn-credential$",
						path: ["data.password"],
					}),
				)
				.transform((val) =>
					val ? Buffer.from(val, "base64").toString("utf-8") : null,
				),
		}),
		publicConnection: z
			.any()
			.optional()
			.describe(
				JSON.stringify({
					resourceType: "service",
					label: "app.kubernetes.io/instance",
					name: "^{{instanceName}}-export$",
					path: [""],
				}),
			)
			.transform((service) => {
				if (!service || !service.spec?.ports?.[0]?.nodePort) {
					return null;
				}
				return {
					port: service.spec.ports[0].nodePort,
				};
			}),
	}),
	backup: z.any().describe(
		JSON.stringify({
			resourceType: "cluster",
			path: ["spec.backup"],
		}),
	),
	pods: z
		.any()
		.describe(
			JSON.stringify({
				resourceType: "pod",
				label: "app.kubernetes.io/instance",
			}),
		)
		.transform((pods: K8sResource[]) => {
			return pods.map((pod: K8sResource) => {
				// Calculate upTime from pod startTime
				let upTime: string | undefined;
				if (pod.status?.startTime) {
					const startedAt = new Date(pod.status.startTime as string);
					const currentTime = new Date();
					const upTimeSeconds = Math.floor(
						(currentTime.getTime() - startedAt.getTime()) / 1000,
					);
					upTime = formatDurationToReadable(upTimeSeconds);
				}

				return {
					name: pod.metadata?.name,
					status: pod.status?.phase,
					upTime,
					containers:
						pod.status?.containerStatuses || [],
				};
			});
		})
		.optional(),
});

export type ClusterObjectQuery = z.infer<typeof ClusterBridgeSchema>;
