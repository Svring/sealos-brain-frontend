import { z } from "zod";

/**
 * Interface for the description JSON that can be found in schema descriptions
 */
export const BridgeQueryItemSchema = z.object({
	resourceType: z.string(),
	path: z.array(z.string()).optional(),
	label: z.string().optional(),
	name: z.string().optional(), // regex pattern for name matching
});

export type BridgeQueryItem = z.infer<typeof BridgeQueryItemSchema>;

/**
 * Bridge query schema containing an array of current BridgeQueryItemSchema
 */
export const BridgeQuerySchema = z.array(BridgeQueryItemSchema);

export type BridgeQuery = z.infer<typeof BridgeQuerySchema>;
