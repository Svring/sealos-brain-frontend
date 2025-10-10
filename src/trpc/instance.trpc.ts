import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { getInstance, listInstances } from "@/lib/sealos/instance/instance.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import {
	CustomResourceTargetSchema,
	resourceTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
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

	getResources: t.procedure
		.input(z.string())
		.output(
			z.object({
				targets: z.array(resourceTargetSchema),
				resources: z.array(z.any()),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Implement get instance resources
			return {
				targets: [],
				resources: [],
			};
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

	delete: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
		// TODO: Implement delete instance
		throw new Error("Not implemented");
	}),

	// Instance Configuration
	updateName: t.procedure
		.input(
			z.object({
				name: z.string(),
				newDisplayName: z.string(),
			}),
		)
		.output(
			z.object({
				name: z.string(),
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

	// Resource Patching
	patch: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				patchBody: z.array(z.record(z.unknown())),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement patch instance
			throw new Error("Not implemented");
		}),

	// Strategic Merge Patch
	merge: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				patchBody: z.record(z.unknown()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement strategic merge patch instance
			throw new Error("Not implemented");
		}),
});

export type InstanceRouter = typeof instanceRouter;
