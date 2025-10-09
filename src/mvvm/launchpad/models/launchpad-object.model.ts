import { z } from "zod";
import { EnvSchema } from "@/mvvm/k8s/models/k8s-resource.model";

export const PortSchema = z.object({
	number: z.number(),
	portName: z.string().optional(),
	nodePort: z.number().optional(),
	protocol: z.string(),
	serviceName: z.string().optional(),
	privateAddress: z.string().optional(),
	privateHost: z.string().optional(),
	publicAddress: z.string().optional(),
	networkName: z.string().optional(),
	host: z.string().optional(),
});

export const ResourceSchema = z.object({
	replicas: z.number(),
	cpu: z.number(),
	memory: z.number(),
});

export const StatefulsetResourceSchema = z.object({
	replicas: z.number(),
	cpu: z.number(),
	memory: z.number(),
	storage: z.number(),
});

export const PodSchema = z.object({
	name: z.string(),
	status: z.string(),
	containers: z.any(),
});

export const ThresholdSchema = z.object({
	resource: z.string(),
	usage: z.number(),
});

export const StrategySchema = z.object({
	type: z.enum(["fixed", "flexible"]),
	minReplicas: z.number().optional(),
	maxReplicas: z.number().optional(),
	threshold: ThresholdSchema.optional(),
});

export const OperationalStatusSchema = z.object({
	createdAt: z.string(),
});

export const ImageRegistrySchema = z.object({
	serverAddress: z.string(),
	username: z.string(),
	password: z.string(),
});

export const ImageSchema = z.object({
	imageName: z.string(),
	imageRegistry: ImageRegistrySchema.nullable().optional(),
});

export const ConfigMapSchema = z.object({
	path: z.string(),
	content: z.string(),
});

export const LocalStorageSchema = z.object({
	path: z.string(),
	value: z.string(),
});

// Deployment object schema
export const DeploymentObjectSchema = z.object({
	name: z.string(),
	kind: z.string(),
	image: ImageSchema,
	resource: ResourceSchema,
	status: z.string().nullable().optional(),
	launchCommand: z
		.object({
			command: z.array(z.string()),
			args: z.array(z.string()),
		})
		.optional(),
	env: z.array(EnvSchema).optional(),
	ports: z.array(PortSchema).optional(),
	configMap: z.array(ConfigMapSchema).optional(),
	pods: z.array(PodSchema).optional(),
	operationalStatus: OperationalStatusSchema.optional(),
	strategy: StrategySchema.optional(),
});

// StatefulSet object schema
export const StatefulsetObjectSchema = z.object({
	name: z.string(),
	kind: z.string(),
	image: ImageSchema,
	resource: StatefulsetResourceSchema,
	status: z.string().nullable(),
	launchCommand: z
		.object({
			command: z.array(z.string()),
			args: z.array(z.string()),
		})
		.optional(),
	env: z.array(EnvSchema).optional(),
	ports: z.array(PortSchema).optional(),
	configMap: z.array(ConfigMapSchema).optional(),
	localStorage: z.array(LocalStorageSchema).optional(),
	pods: z.array(PodSchema).optional(),
	operationalStatus: OperationalStatusSchema.optional(),
	strategy: StrategySchema.optional(),
});

// Unified launchpad object schema (discriminated union)
export const LaunchpadObjectSchema = z.discriminatedUnion("kind", [
	DeploymentObjectSchema.extend({
		kind: z.literal("Deployment"),
	}),
	StatefulsetObjectSchema.extend({
		kind: z.literal("StatefulSet"),
	}),
]);

export type Port = z.infer<typeof PortSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type StatefulsetResource = z.infer<typeof StatefulsetResourceSchema>;
export type Pod = z.infer<typeof PodSchema>;
export type Threshold = z.infer<typeof ThresholdSchema>;
export type Strategy = z.infer<typeof StrategySchema>;
export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;
export type ImageRegistry = z.infer<typeof ImageRegistrySchema>;
export type Image = z.infer<typeof ImageSchema>;
export type ConfigMap = z.infer<typeof ConfigMapSchema>;
export type LocalStorage = z.infer<typeof LocalStorageSchema>;
export type DeploymentObject = z.infer<typeof DeploymentObjectSchema>;
export type StatefulsetObject = z.infer<typeof StatefulsetObjectSchema>;
export type LaunchpadObject = z.infer<typeof LaunchpadObjectSchema>;
