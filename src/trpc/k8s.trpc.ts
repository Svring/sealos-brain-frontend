import { initTRPC } from "@trpc/server";
import type { Operation } from "fast-json-patch";
import { z } from "zod";
import {
	deleteResource,
	getResource,
	listResources,
	patchResource,
	patchResourceMetadata,
	removeResourceMetadata,
	strategicMergePatchResource,
	upsertResource,
} from "@/lib/k8s/k8s-service.api";
import {
	resourceTargetSchema,
	resourceTypeTargetSchema,
} from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { ResourceQuotaSchema } from "@/mvvm/quota/models/quota-resource.model";

// Context creation function
export async function createK8sContext(opts: {
	req: Request;
}): Promise<K8sContext> {
	const kubeconfig = opts.req.headers.get("kubeconfig");

	return {
		kubeconfig: kubeconfig as string,
	};
}

const t = initTRPC.context<K8sContext>().create();

export const k8sRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Resource Information
	list: t.procedure
		.input(resourceTypeTargetSchema)
		.query(async ({ ctx, input }) => {
			return await listResources(ctx, input);
		}),

	get: t.procedure.input(resourceTargetSchema).query(async ({ ctx, input }) => {
		return await getResource(ctx, input);
	}),

	// Quota Management
	quota: t.procedure.query(async ({ ctx }) => {
		// List resource quotas using the builtin resource type
		const quotaTarget = {
			type: "builtin" as const,
			resourceType: "resourcequota" as const,
		};

		const quotaList = await listResources(ctx, quotaTarget);

		// Return the first resource quota if available
		if (quotaList.items && quotaList.items.length > 0) {
			const rawQuota = quotaList.items[0];

			// Validate and parse the quota using our schema
			return ResourceQuotaSchema.parse(rawQuota);
		}

		throw new Error("No resource quotas found");
	}),

	// Events Management
	events: t.procedure.input(resourceTargetSchema).query(async () => {
		// TODO: Implement events fetching - placeholder for now
		throw new Error("Events fetching not implemented yet");
	}),

	// Pod Management
	pods: t.procedure
		.input(resourceTargetSchema)
		.query(async ({ ctx, input }) => {
			// List pods by filtering for pod resource type
			const podTarget = {
				...input,
				type: "builtin" as const,
				resourceType: "pod" as const,
			};
			return await listResources(ctx, podTarget);
		}),

	// Logs Management
	logs: t.procedure.input(resourceTargetSchema).query(async () => {
		// TODO: Implement logs fetching - placeholder for now
		throw new Error("Logs fetching not implemented yet");
	}),

	// ===== MUTATION PROCEDURES =====

	// Resource Lifecycle Management
	delete: t.procedure
		.input(z.union([resourceTargetSchema, z.array(resourceTargetSchema)]))
		.mutation(async ({ ctx, input }) => {
			const targets = Array.isArray(input) ? input : [input];
			const results = await Promise.all(
				targets.map((target) => deleteResource(ctx, target)),
			);
			return results;
		}),

	upsert: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				resourceBody: z.record(z.unknown()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, resourceBody } = input;
			return await upsertResource(ctx, target, resourceBody);
		}),

	// Resource Patching
	patch: t.procedure
		.input(
			z.object({
				target: resourceTargetSchema,
				patchBody: z.array(z.record(z.unknown())), // Operation[]
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, patchBody } = input;
			return await patchResource(
				ctx,
				target,
				patchBody as unknown as Operation[],
			);
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
			const { target, patchBody } = input;
			return await strategicMergePatchResource(ctx, target, patchBody);
		}),

	// Metadata Management
	patchMeta: t.procedure
		.input(
			z.object({
				target: z.union([resourceTargetSchema, z.array(resourceTargetSchema)]),
				metadataType: z.enum(["annotations", "labels"]),
				key: z.string(),
				value: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, metadataType, key, value } = input;
			const targets = Array.isArray(target) ? target : [target];
			const results = await Promise.all(
				targets.map((t) =>
					patchResourceMetadata(ctx, t, metadataType, key, value),
				),
			);
			return results;
		}),

	removeMeta: t.procedure
		.input(
			z.object({
				target: z.union([resourceTargetSchema, z.array(resourceTargetSchema)]),
				metadataType: z.enum(["annotations", "labels"]),
				key: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { target, metadataType, key } = input;
			const targets = Array.isArray(target) ? target : [target];
			const results = await Promise.all(
				targets.map((t) => removeResourceMetadata(ctx, t, metadataType, key)),
			);
			return results;
		}),
});

export type K8sRouter = typeof k8sRouter;
