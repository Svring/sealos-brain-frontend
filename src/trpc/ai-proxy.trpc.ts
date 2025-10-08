import { KubeConfig } from "@kubernetes/client-node";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

// ===== CONTEXT =====
export async function createAiProxyContext(opts: { req: Request }) {
	const kubeconfig = opts.req.headers.get("kubeconfig");
	const appToken = opts.req.headers.get("appToken");

	// Decode kubeconfig if it was percent-encoded when sent via headers
	const decodedKubeconfig = decodeURIComponent(kubeconfig as string);

	// Extract regionUrl from kubeconfig
	let regionUrl = "";
	try {
		const kc = new KubeConfig();
		kc.loadFromString(decodedKubeconfig);

		const currentContext = kc.getCurrentContext();
		const contextObj = kc.getContextObject(currentContext);

		if (contextObj?.cluster) {
			const clusterObj = kc.getCluster(contextObj.cluster);
			if (clusterObj?.server) {
				// Parse the server URL to extract hostname
				const url = new URL(clusterObj.server);
				regionUrl = url.hostname;
			}
		}
	} catch (error) {
		console.error("Failed to extract region URL from kubeconfig:", error);
	}

	return {
		authorization: appToken as string,
		regionUrl: regionUrl,
	};
}

export type AiProxyContext = Awaited<ReturnType<typeof createAiProxyContext>>;

// ===== SCHEMAS =====

// ===== ROUTER =====

const t = initTRPC.context<AiProxyContext>().create();

export const aiProxyRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Token Listing
	list: t.procedure.query(async ({ ctx: _ctx }) => {
		// TODO: Implement getAiProxyTokensService
		// return await getAiProxyTokensService(ctx);
		return [];
	}),

	// Free Usage Information
	freeUsage: t.procedure
		.output(z.object({
			total_limit: z.number(),
			used_today: z.number(),
			remaining_today: z.number(),
			next_reset_time: z.number(),
		}))
		.query(async ({ ctx: _ctx }) => {
			// TODO: Implement getAiProxyFreeUsageService
			// return await getAiProxyFreeUsageService(ctx);
			return {
				total_limit: 1000,
				used_today: 0,
				remaining_today: 1000,
				next_reset_time: Date.now() + 24 * 60 * 60 * 1000,
			};
		}),

	// ===== MUTATION PROCEDURES =====

	// Token Management
	create: t.procedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input, ctx: _ctx }) => {
			// TODO: Implement createAiProxyTokenService
			// return await createAiProxyTokenService(input, ctx);
			return { id: Math.random(), name: input.name, created_at: new Date() };
		}),
});

export type AiProxyRouter = typeof aiProxyRouter;
