import { z } from "zod";

export const CustomResourceConfigSchema = z.object({
	type: z.literal("custom"),
	resourceType: z.enum([
		"issuer",
		"certificate",
		"backup",
		"devbox",
		"cluster",
		"instance",
		"objectstoragebucket",
		"app",
	]),
	group: z.string(),
	version: z.string(),
	plural: z.string(),
});

export const CustomResourceTargetSchema = z.object({
	type: z.literal("custom"),
	resourceType: z.string(),
	name: z.string(),
});

export const CustomResourceTypeTargetSchema = z.object({
	type: z.literal("custom"),
	resourceType: z.string(),
	name: z.string().optional(),
	labelSelector: z.array(z.string()).optional(),
}).refine(
	(data) => {
		// If labelSelector is present, name must also be provided
		if (data.labelSelector && data.labelSelector.length > 0) {
			return data.name !== undefined && data.name !== "";
		}
		return true;
	},
	{
		message: "If labelSelector is provided, name must also be provided",
		path: ["name"],
	}
);

// Derived types from schemas
export type CustomResourceConfig = z.infer<typeof CustomResourceConfigSchema>;
export type CustomResourceTarget = z.infer<typeof CustomResourceTargetSchema>;
export type CustomResourceTypeTarget = z.infer<typeof CustomResourceTypeTargetSchema>;
