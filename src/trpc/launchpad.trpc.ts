import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createLaunchpad,
	deleteLaunchpad,
	getLaunchpad,
	getLaunchpadLogs,
	listLaunchpads,
	pauseLaunchpad,
	restartLaunchpad,
	startLaunchpad,
	updateLaunchpad,
} from "@/lib/sealos/launchpad/launchpad.api";
import {
	getLaunchpadMonitor,
	getLaunchpadResources,
} from "@/lib/sealos/launchpad/launchpad-service.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";
import { BuiltinResourceTargetSchema } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { launchpadCreateSchema } from "@/mvvm/sealos/launchpad/models/launchpad-create.model";
import { launchpadUpdateSchema } from "@/mvvm/sealos/launchpad/models/launchpad-update.model";

// Context creation function
export async function createLaunchpadContext(opts: {
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

export const launchpadRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Launchpad Information
	get: t.procedure
		.input(BuiltinResourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getLaunchpad(ctx, input);
		}),

	list: t.procedure
		.input(z.string().optional().default("launchpad"))
		.query(async ({ ctx, input: _input }) => {
			return await listLaunchpads(ctx);
		}),

	logs: t.procedure
		.input(BuiltinResourceTargetSchema)
		.query(async ({ ctx, input }) => {
			return await getLaunchpadLogs(ctx, input);
		}),

	network: t.procedure
		.input(BuiltinResourceTargetSchema)
		.query(async ({ input, ctx }) => {}),

	// Monitoring
	monitor: t.procedure
		.input(
			BuiltinResourceTargetSchema.extend({
				step: z.string().optional().default("2m"),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getLaunchpadMonitor(ctx, input.name, input.step);
		}),

	resources: t.procedure
		.input(
			z.object({
				target: BuiltinResourceTargetSchema,
				resources: z
					.array(z.string())
					.optional()
					.default([
						"ingress",
						"service",
						"pvc",
						"configmap",
						"pod",
						"issuer",
						"certificate",
					]),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await getLaunchpadResources(ctx, input.target, input.resources);
		}),

	pods: t.procedure
		.input(z.string())
		.query(async ({ input: _input, ctx: _ctx }) => {
			// return await getLaunchpadApplicationPods(ctx, input);
		}),

	// ===== MUTATION PROCEDURES =====

	// Launchpad Lifecycle Management
	create: t.procedure
		.input(launchpadCreateSchema)
		.mutation(async ({ input, ctx }) => {
			return await createLaunchpad(ctx, input);
		}),

	update: t.procedure
		.input(launchpadUpdateSchema)
		.mutation(async ({ input, ctx }) => {
			return await updateLaunchpad(ctx, input);
		}),

	start: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await startLaunchpad(ctx, input.name);
		}),

	pause: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await pauseLaunchpad(ctx, input.name);
		}),

	restart: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await restartLaunchpad(ctx, input.name);
		}),

	delete: t.procedure
		.input(BuiltinResourceTargetSchema)
		.mutation(async ({ input, ctx }) => {
			return await deleteLaunchpad(ctx, input.name);
		}),
});

export type LaunchpadRouter = typeof launchpadRouter;
