import { formatIsoDateToReadable } from "@/lib/date/date-utils";
import { convertK8sQuantityToUniversalUnit } from "@/lib/k8s/k8s.utils";
import type { ConfigMapResource } from "@/mvvm/sealos/configmap/models/configmap-resource.model";
import type { Container as DeploymentContainer } from "@/mvvm/sealos/launchpad/models/deployment-resource.model";
import type { Container as StatefulSetContainer } from "@/mvvm/sealos/launchpad/models/statefulset-resource.model";
import type { PodResource } from "@/mvvm/sealos/pod/models/pod-resource.model";
import type { PVCResource } from "@/mvvm/sealos/pvc/models/pvc-resource.model";

// Common transformation functions for launchpad resources

/**
 * Transform image and registry information from containers and secret data
 */
export const transformImage = (resources: unknown[]) => {
	if (!Array.isArray(resources) || resources.length < 2) {
		return {
			imageName: "",
			imageRegistry: null,
		};
	}

	const [containers, secretData] = resources;

	// Extract image name from containers
	let imageName = "";
	if (Array.isArray(containers) && containers.length > 0) {
		imageName = containers[0]?.image || "";
	}

	// Extract registry information from secret data
	let imageRegistry = null;
	if (
		secretData &&
		typeof secretData === "object" &&
		".dockerconfigjson" in secretData
	) {
		try {
			// Decode the base64 encoded docker config
			const dockerConfigJson = Buffer.from(
				(secretData as any)[".dockerconfigjson"],
				"base64",
			).toString("utf-8");

			const dockerConfig = JSON.parse(dockerConfigJson);

			// Extract registry information from auths
			if (dockerConfig.auths && typeof dockerConfig.auths === "object") {
				const serverAddresses = Object.keys(dockerConfig.auths);

				if (serverAddresses.length > 0) {
					const serverAddress = serverAddresses[0];
					const authInfo = dockerConfig.auths[serverAddress];

					imageRegistry = {
						serverAddress,
						username: authInfo.username || "",
						password: authInfo.password || "",
					};
				}
			}
		} catch (error) {
			console.error("Error parsing docker config:", error);
		}
	}

	return {
		imageName,
		imageRegistry,
	};
};

/**
 * Transform resource information for deployments (CPU and memory only)
 */
export const transformDeploymentResource = (spec: unknown) => {
	if (!spec) return {};

	const resource = spec as any;
	const replicas = resource.spec?.replicas;
	const containers = resource.spec?.template?.spec?.containers;

	if (Array.isArray(containers) && containers.length > 0) {
		const limits = containers[0].resources?.limits || {};
		const k8sResource: any = {
			replicas,
			...limits,
		};

		// Convert Kubernetes resource strings to numeric values
		const convertedResource = {
			cpu: convertK8sQuantityToUniversalUnit(k8sResource.cpu || "0", "cpu"),
			memory: convertK8sQuantityToUniversalUnit(
				k8sResource.memory || "0",
				"memory",
			),
		};

		const result: any = {
			replicas,
			cpu: convertedResource.cpu,
			memory: convertedResource.memory,
		};

		return result;
	}

	return { replicas };
};

/**
 * Transform resource information for statefulsets (CPU, memory, and storage)
 */
export const transformStatefulSetResource = (spec: unknown) => {
	if (!spec) return {};

	const resource = spec as any;
	const replicas = resource.spec?.replicas;
	const containers = resource.spec?.template?.spec?.containers;

	if (Array.isArray(containers) && containers.length > 0) {
		const limits = containers[0].resources?.limits || {};
		const k8sResource: any = {
			replicas,
			...limits,
		};

		// For StatefulSet, also extract storage
		const volumeClaimTemplates = resource.spec?.volumeClaimTemplates;
		const storage =
			Array.isArray(volumeClaimTemplates) && volumeClaimTemplates.length > 0
				? volumeClaimTemplates[0].spec?.resources?.requests?.storage || ""
				: "";
		k8sResource.storage = storage;

		// Convert Kubernetes resource strings to numeric values
		const convertedResource = {
			cpu: convertK8sQuantityToUniversalUnit(k8sResource.cpu || "0", "cpu"),
			memory: convertK8sQuantityToUniversalUnit(
				k8sResource.memory || "0",
				"memory",
			),
		};

		const result: any = {
			replicas,
			cpu: convertedResource.cpu,
			memory: convertedResource.memory,
		};

		// Add storage for StatefulSet
		if (k8sResource.storage) {
			const storage = convertK8sQuantityToUniversalUnit(
				k8sResource.storage,
				"storage",
			);
			return { ...result, storage };
		}

		return result;
	}

	// Convert storage even when no containers are found
	const volumeClaimTemplates = resource.spec?.volumeClaimTemplates;
	const storage =
		Array.isArray(volumeClaimTemplates) && volumeClaimTemplates.length > 0
			? volumeClaimTemplates[0].spec?.resources?.requests?.storage || ""
			: "";
	const convertedStorage = convertK8sQuantityToUniversalUnit(
		storage,
		"storage",
	);
	return {
		replicas,
		storage: convertedStorage,
	};
};

/**
 * Transform HPA strategy information
 */
export const transformStrategy = (strategy: unknown) => {
	if (!strategy) {
		return { type: "fixed" };
	}

	const strategyObj = strategy as any;
	// Extract threshold information from metrics
	const threshold =
		strategyObj.metrics && strategyObj.metrics.length > 0
			? {
					resource: strategyObj.metrics[0].resource.name,
					usage: strategyObj.metrics[0].resource.target.averageUtilization / 10,
				}
			: null;

	return {
		type: "flexible",
		minReplicas: strategyObj.minReplicas,
		maxReplicas: strategyObj.maxReplicas,
		threshold,
	};
};

/**
 * Transform environment variables for deployment containers
 */
export const transformDeploymentEnv = (containers: unknown[]) => {
	if (Array.isArray(containers) && containers.length > 0) {
		const container = containers[0] as DeploymentContainer;
		const env = container.env;
		if (!Array.isArray(env)) return [];

		return env.map((envVar) => {
			if (envVar.value) {
				// Direct value environment variable
				return {
					name: envVar.name,
					value: envVar.value,
				};
			} else if (envVar.valueFrom?.secretKeyRef) {
				// Secret reference environment variable
				return {
					name: envVar.name,
					valueFrom: {
						secretKeyRef: {
							name: envVar.valueFrom.secretKeyRef.name,
							key: envVar.valueFrom.secretKeyRef.key,
						},
					},
				};
			} else {
				// Unknown type, return as value with placeholder
				return {
					name: envVar.name,
					value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
				};
			}
		});
	}
	return [];
};

/**
 * Transform environment variables for statefulset containers
 */
export const transformStatefulSetEnv = (containers: unknown[]) => {
	if (Array.isArray(containers) && containers.length > 0) {
		const container = containers[0] as StatefulSetContainer;
		const env = container.env;
		if (!Array.isArray(env)) return [];

		return env.map((envVar) => {
			if (envVar.value) {
				// Direct value environment variable
				return {
					name: envVar.name,
					value: envVar.value,
				};
			} else if (envVar.valueFrom?.secretKeyRef) {
				// Secret reference environment variable
				return {
					name: envVar.name,
					valueFrom: {
						secretKeyRef: {
							name: envVar.valueFrom.secretKeyRef.name,
							key: envVar.valueFrom.secretKeyRef.key,
						},
					},
				};
			} else {
				// Unknown type, return as value with placeholder
				return {
					name: envVar.name,
					value: `[UNKNOWN_ENV_TYPE: ${JSON.stringify(envVar)}]`,
				};
			}
		});
	}
	return [];
};

/**
 * Transform config map information
 */
export const transformConfigMap = (resources: unknown[]) => {
	if (!Array.isArray(resources) || resources.length < 2) {
		return [];
	}

	const [containers, configmap] = resources;

	if (!Array.isArray(containers) || containers.length === 0) {
		return [];
	}
	const container = containers[0] as {
		volumeMounts?: Array<{ subPath?: string; mountPath: string }>;
	};
	if (!container?.volumeMounts) {
		return [];
	}

	const configmapObj = configmap as ConfigMapResource;
	if (!configmapObj?.data) {
		return [];
	}

	const result = container.volumeMounts
		.filter((mount) => mount.subPath) // Only include mounts with subPath
		.map((mount) => ({
			path: mount.mountPath,
			content: mount.subPath ? configmapObj.data?.[mount.subPath] || "" : "",
		}));

	return result;
};

/**
 * Transform local storage (PVC) information
 */
export const transformLocalStorage = (pvcs: unknown[]) => {
	if (!Array.isArray(pvcs)) return [];

	return pvcs.map((pvc: unknown) => {
		const pvcResource = pvc as PVCResource;
		const annotations = pvcResource.metadata?.annotations || {};
		return {
			path: annotations.path || "",
			value: annotations.value || "",
		};
	});
};

/**
 * Transform pod information
 */
export const transformPods = (pods: unknown[]) => {
	if (!Array.isArray(pods)) return [];

	return pods.map((pod: unknown) => {
		const podResource = pod as PodResource;
		return {
			name: podResource.metadata?.name || "",
			status: podResource.status?.phase || "Unknown",
			containers:
				podResource.status?.containerStatuses?.map((container) => ({
					name: container.name,
					ready: container.ready,
					state: container.state,
					restartCount: container.restartCount,
				})) || [],
		};
	});
};

/**
 * Transform operational status information
 */
export const transformOperationalStatus = (resource: unknown) => {
	if (!resource) return { createdAt: "Unknown" };

	const metadata = (resource as any).metadata || {};
	const createdAt = formatIsoDateToReadable(metadata.creationTimestamp);

	return {
		createdAt,
	};
};

/**
 * Transform launch command information
 */
export const transformLaunchCommand = (containers: unknown[]) => {
	if (Array.isArray(containers) && containers.length > 0) {
		const container = containers[0] as any;
		return {
			command: container.command || [],
			args: container.args || [],
		};
	}
	return {
		command: [],
		args: [],
	};
};
