import { z } from "zod";

// Resource quota limits schema
export const ResourceQuotaLimitsSchema = z.object({
	"limits.cpu": z.string().optional(),
	"limits.ephemeral-storage": z.string().optional(),
	"limits.memory": z.string().optional(),
	"limits.nvidia.com/gpu": z.string().optional(),
	"objectstorage/bucket": z.string().optional(),
	"objectstorage/size": z.string().optional(),
	"requests.nvidia.com/gpu": z.string().optional(),
	"requests.storage": z.string().optional(),
	"services.nodeports": z.string().optional(),
	// Allow for additional dynamic resource limits
}).catchall(z.string());

// Resource quota used schema
export const ResourceQuotaUsedSchema = z.object({
	"limits.cpu": z.string().optional(),
	"limits.ephemeral-storage": z.string().optional(),
	"limits.memory": z.string().optional(),
	"requests.nvidia.com/gpu": z.string().optional(),
	"requests.storage": z.string().optional(),
	"services.nodeports": z.string().optional(),
	// Allow for additional dynamic resource usage
}).catchall(z.string());

// Resource quota spec schema
export const ResourceQuotaSpecSchema = z.object({
	hard: ResourceQuotaLimitsSchema,
	scopes: z.array(z.string()).optional(),
	scopeSelector: z.object({
		matchExpressions: z.array(z.object({
			key: z.string(),
			operator: z.string(),
			values: z.array(z.string()).optional(),
		})).optional(),
	}).optional(),
});

// Resource quota status schema
export const ResourceQuotaStatusSchema = z.object({
	hard: ResourceQuotaLimitsSchema,
	used: ResourceQuotaUsedSchema,
});

// Main resource quota schema
export const ResourceQuotaSchema = z.object({
	apiVersion: z.literal("v1"),
	kind: z.literal("ResourceQuota"),
	metadata: z.object({
		annotations: z.record(z.string(), z.string()).optional(),
		creationTimestamp: z.string(),
		finalizers: z.array(z.string()).optional(),
		generation: z.number().optional(),
		labels: z.record(z.string(), z.string()).optional(),
		name: z.string(),
		namespace: z.string(),
		resourceVersion: z.string(),
		uid: z.string(),
	}),
	spec: ResourceQuotaSpecSchema,
	status: ResourceQuotaStatusSchema,
});

// Type exports
export type ResourceQuotaLimits = z.infer<typeof ResourceQuotaLimitsSchema>;
export type ResourceQuotaUsed = z.infer<typeof ResourceQuotaUsedSchema>;
export type ResourceQuotaSpec = z.infer<typeof ResourceQuotaSpecSchema>;
export type ResourceQuotaStatus = z.infer<typeof ResourceQuotaStatusSchema>;
export type ResourceQuota = z.infer<typeof ResourceQuotaSchema>;
