import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	getInstance,
	getInstanceResources,
	listInstances,
} from "@/lib/sealos/instance/instance.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import {
	CustomResourceTargetSchema,
	resourceTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { K8sItemSchema } from "@/mvvm/k8s/models/k8s-resource.model";
import { InstanceObjectSchema } from "@/mvvm/sealos/instance/models/instance-object.model";
import { InstanceResourceSchema } from "@/mvvm/sealos/instance/models/instance-resource.model";

// Context creation function
export async function createInstanceContext(opts: {
	req: Request;
}): Promise<K8sContext> {
	const kubeconfigEncoded = opts.req.headers.get("kubeconfigEncoded");
	if (!kubeconfigEncoded) {
		throw new Error("kubeconfigEncoded header is required");
	}

	const kubeconfig = decodeURIComponent(kubeconfigEncoded);

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
		.output(z.array(K8sItemSchema))
		.query(async ({ ctx, input }) => {
			return await getInstanceResources(ctx, input.name);
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
