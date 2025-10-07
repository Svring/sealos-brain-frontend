import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	resourceTargetSchema,
	resourceTypeTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";

// Context creation function
export async function createK8sContext(opts: {
	req: Request;
}): Promise<K8sContext> {
	const kubeconfig = opts.req.headers.get("kubeconfig");

	// Decode kubeconfig if it was percent-encoded when sent via headers
	const decodedKubeconfig = decodeURIComponent(kubeconfig as string);

	return {
		kubeconfig: decodedKubeconfig as string,
	};
}

const t = initTRPC.context<K8sContext>().create();

export const k8sRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Resource Information
	list: t.procedure
		.input(resourceTypeTargetSchema)
		.query(async ({ ctx, input }) => {
			// TODO: Implement listAllResources
			throw new Error("Not implemented");
		}),

	get: t.procedure.input(resourceTargetSchema).query(async ({ ctx, input }) => {
		// TODO: Implement getResource
		throw new Error("Not implemented");
	}),

	// Quota Management
	quota: t.procedure.query(async ({ ctx }) => {
		// TODO: Implement getQuota
		throw new Error("Not implemented");
	}),

	// Events Management
	events: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			// TODO: Implement events fetching
			throw new Error("Not implemented");
		}),

	// Pod Management
	pods: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			// TODO: Implement pods fetching
			throw new Error("Not implemented");
		}),

	// Logs Management
	logs: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			// TODO: Implement logs fetching
			throw new Error("Not implemented");
		}),

	// ===== MUTATION PROCEDURES =====

	// Resource Lifecycle Management
	delete: t.procedure
		.input(
			z.union([resourceTypeTargetSchema, z.array(resourceTypeTargetSchema)]),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement resource deletion
			throw new Error("Not implemented");
		}),

	upsert: t.procedure
		.input(
			z.object({
				target: resourceTypeTargetSchema,
				resourceBody: z.record(z.unknown()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement resource upsert
			throw new Error("Not implemented");
		}),

	// Metadata Management
	patchMetadata: t.procedure
		.input(
			z.union([resourceTypeTargetSchema, z.array(resourceTypeTargetSchema)]),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement metadata patching
			throw new Error("Not implemented");
		}),

	removeMetadata: t.procedure
		.input(
			z.union([resourceTypeTargetSchema, z.array(resourceTypeTargetSchema)]),
		)
		.mutation(async ({ ctx, input }) => {
			// TODO: Implement metadata removal
			throw new Error("Not implemented");
		}),
});

export type K8sRouter = typeof k8sRouter;
