import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { INSTANCE_LABELS } from "@/constants/instance/instance-labels.constant";
import { selectResources } from "@/lib/k8s/k8s-service.api";
import { getInstance, listInstances } from "@/lib/sealos/instance/instance.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import {
	CustomResourceTargetSchema,
	resourceTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import {
	K8sResourceListSchema,
	K8sResourceSchema,
} from "@/mvvm/k8s/models/k8s-resource.model";
import { InstanceObjectSchema } from "@/mvvm/sealos/instance/models/instance-object.model";
import { InstanceResourceSchema } from "@/mvvm/sealos/instance/models/instance-resource.model";

// Context creation function
export async function createInstanceContext(opts: {
	req: Request;
}): Promise<K8sContext> {
	const kubeconfigEncoded = opts.req.headers.get("kubeconfig");
	const kubeconfig = kubeconfigEncoded
		? decodeURIComponent(kubeconfigEncoded)
		: "";

	return {
		kubeconfig,
	};
}

const t = initTRPC.context<K8sContext>().create(createErrorFormatter());

export const instanceRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Instance Information
	list: t.procedure
		.input(
			z
				.object({
					resourceType: z.literal("instance"),
				})
				.default({ resourceType: "instance" }),
		)
		.output(z.array(InstanceObjectSchema))
		.query(async ({ ctx }) => {
			return await listInstances(ctx);
		}),

	get: t.procedure
		.input(CustomResourceTargetSchema)
		.output(InstanceObjectSchema)
		.query(async ({ ctx, input }) => {
			return await getInstance(ctx, input);
		}),

	resources: t.procedure
		.input(CustomResourceTargetSchema)
		.output(z.array(K8sResourceSchema))
		.query(async ({ ctx, input }) => {
			// Create a ResourceTypeTarget with the instance name and label
			const resourceTypeTarget = {
				type: "custom" as const,
				resourceType: "instance" as const,
				name: input.name,
				label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
			};

			// Use selectResources to get the specified resource types
			const selectedResources = await selectResources(
				ctx,
				resourceTypeTarget,
				["deployment", "statefulset"], // builtin resource types
				["devbox", "cluster", "objectstoragebucket"], // custom resource types
			);

			// Flatten and spread all resources
			const resources: z.infer<typeof K8sResourceSchema>[] = [];

			// Process each resource type
			for (const [_, resourceList] of Object.entries(selectedResources)) {
				if (resourceList) {
					// Parse and validate the resource list
					const parsedList = K8sResourceListSchema.parse(resourceList);
					resources.push(...parsedList.items);
				}
			}

			return resources;
		}),

	// ===== MUTATION PROCEDURES =====

	// Instance Lifecycle Management
	create: t.procedure
		.input(
			z.object({
				name: z.string(),
				title: z.string().optional(),
				description: z.string().optional(),
				templateType: z.string().default("inline"),
				defaults: z.record(z.string(), z.any()).optional(),
			}),
		)
		.output(InstanceResourceSchema)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement create instance
			throw new Error("Not implemented");
		}),

	delete: t.procedure
		.input(CustomResourceTargetSchema)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement delete instance
			throw new Error("Not implemented");
		}),

	// Instance Configuration
	update: t.procedure
		.input(
			z.object({
				target: CustomResourceTargetSchema,
				newDisplayName: z.string(),
			}),
		)
		.output(
			z.object({
				target: CustomResourceTargetSchema,
				newDisplayName: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement update instance name
			throw new Error("Not implemented");
		}),

	// Resource Management
	addResources: t.procedure
		.input(
			z.object({
				resources: z.array(resourceTargetSchema),
				name: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement add resources to instance
			throw new Error("Not implemented");
		}),

	removeResources: t.procedure
		.input(
			z.object({
				resources: z.array(resourceTargetSchema),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement remove resources from instance
			throw new Error("Not implemented");
		}),
});

export type InstanceRouter = typeof instanceRouter;
