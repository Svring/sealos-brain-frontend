import { z } from "zod";

// Base Kubernetes object schema with mandatory fields
export const ResourceObjectSchema = z
	.object({
		name: z.string(),
		resourceType: z.string(),
	})
	.passthrough(); // Allow additional fields without validation

// Type export
export type ResourceObject = z.infer<typeof ResourceObjectSchema>;
