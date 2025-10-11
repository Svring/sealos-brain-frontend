import { initTRPC } from "@trpc/server";
import { z } from "zod";
import {
	createThread,
	deleteThread,
	getThread,
	listThreads,
	patchThread,
	searchThreads,
	updateThreadState,
} from "@/lib/langgraph/langgraph.api";
import { createErrorFormatter } from "@/lib/trpc/trpc.utils";

// Context creation function
export async function createLanggraphContext(opts: { req: Request }) {
	// TODO: Implement context creation
	return {};
}

export type LanggraphContext = Awaited<
	ReturnType<typeof createLanggraphContext>
>;

const t = initTRPC.context<LanggraphContext>().create(createErrorFormatter());

export const langgraphRouter = t.router({
	// ===== QUERY PROCEDURES =====

	// Thread Information
	list: t.procedure.query(async ({ ctx }) => {
		return await listThreads();
	}),

	get: t.procedure.input(z.string()).query(async ({ ctx, input }) => {
		return await getThread(input);
	}),

	search: t.procedure.input(z.record(z.any())).query(async ({ ctx, input }) => {
		return await searchThreads(input);
	}),

	// ===== MUTATION PROCEDURES =====

	// Thread Lifecycle Management
	create: t.procedure
		.input(
			z.object({
				metadata: z.record(z.any()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { metadata } = input;

			// Default supersteps
			const supersteps = [
				{
					updates: [
						{
							values: {},
							asNode: "__input__",
						},
					],
				},
			];

			return await createThread({
				metadata: metadata || {},
				supersteps,
			});
		}),

	// Update thread state
	updateState: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				values: z.any(),
				asNode: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { threadId, values, asNode } = input;
			return await updateThreadState(threadId, values, asNode);
		}),

	// Delete thread
	delete: t.procedure.input(z.string()).mutation(async ({ ctx, input }) => {
		return await deleteThread(input);
	}),

	// Patch thread metadata
	patch: t.procedure
		.input(
			z.object({
				threadId: z.string(),
				metadata: z.record(z.any()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { threadId, metadata } = input;
			return await patchThread(threadId, metadata);
		}),
});

export type LanggraphRouter = typeof langgraphRouter;
