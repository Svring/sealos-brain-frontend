"use server";

import https from "node:https";
import axios, { type AxiosInstance } from "axios";
import { z } from "zod";

// ===== SCHEMAS =====

// Create Token Schemas
const AiProxyCreateTokenRequestSchema = z.object({
	name: z.string(),
});

const AiProxyCreateTokenResponseSchema = z.object({
	code: z.number(),
	data: z.any(),
	message: z.string(),
});

// Free Usage Schemas
const AiProxyFreeUsageResponseSchema = z.object({
	total_limit: z.number(),
	used_today: z.number(),
	remaining_today: z.number(),
	next_reset_time: z.number(),
});

// Delete Token Schemas
const AiProxyDeleteTokenRequestSchema = z.object({
	id: z.number(),
});

const AiProxyDeleteTokenResponseSchema = z.object({
	code: z.literal(200),
	message: z.literal("Token deleted successfully"),
});

// ===== TYPES =====

export type AiProxyCreateTokenRequest = z.infer<
	typeof AiProxyCreateTokenRequestSchema
>;
export type AiProxyCreateTokenResponse = z.infer<
	typeof AiProxyCreateTokenResponseSchema
>;
export type AiProxyFreeUsageResponse = z.infer<
	typeof AiProxyFreeUsageResponseSchema
>;
export type AiProxyDeleteTokenRequest = z.infer<
	typeof AiProxyDeleteTokenRequestSchema
>;
export type AiProxyDeleteTokenResponse = z.infer<
	typeof AiProxyDeleteTokenResponseSchema
>;

// ===== API CLIENT CREATION =====

export async function createAiProxyApi(
	baseUrl: string,
	authorization?: string,
): Promise<AxiosInstance> {
	const isDevelopment = process.env.MODE === "development";
	return axios.create({
		baseURL: `http://aiproxy-web.${baseUrl}/api`,
		headers: {
			"Content-Type": "application/json",
			...(authorization ? { Authorization: authorization } : {}),
		},
		httpsAgent: isDevelopment
			? new https.Agent({ rejectUnauthorized: false })
			: undefined,
	});
}

// ===== MUTATION OPERATIONS =====

// Token Management
export async function createAiProxyToken(
	ctx: { regionUrl: string; authorization: string },
	request: AiProxyCreateTokenRequest,
): Promise<AiProxyCreateTokenResponse> {
	try {
		const validatedRequest = AiProxyCreateTokenRequestSchema.parse(request);
		const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
		const response = await api.post("/user/token", validatedRequest);

		// Check if the response indicates success
		if (response.data.code === 200) {
			return response.data;
		} else {
			// If the API returns a non-200 code but the request technically succeeded
			// (e.g., token already exists), we can still return success
			if (
				response.data.message?.includes("already exists") ||
				response.data.message?.includes("success")
			) {
				return {
					code: 200,
					data: response.data.data || {},
					message: response.data.message || "Token created successfully",
				};
			}

			// Otherwise, throw an error
			throw new Error(`API Error: ${response.data.message || "Unknown error"}`);
		}
	} catch (error) {
		console.error("Error creating AI Proxy Token:", JSON.stringify(error));
		throw error;
	}
}

export async function deleteAiProxyToken(
	ctx: { regionUrl: string; authorization: string },
	request: AiProxyDeleteTokenRequest,
): Promise<AiProxyDeleteTokenResponse> {
	const validatedRequest = AiProxyDeleteTokenRequestSchema.parse(request);
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.delete(`/user/token/${validatedRequest.id}`);
	return AiProxyDeleteTokenResponseSchema.parse(response.data);
}

// ===== QUERY OPERATIONS =====

// Token Listing
export async function getAiProxyTokens(ctx: {
	regionUrl: string;
	authorization: string;
}) {
	const api = await createAiProxyApi(ctx.regionUrl, ctx.authorization);
	const response = await api.get("/user/token", {
		params: { page: 1, perPage: 10 },
	});
	return response.data.data.tokens;
}

// Free Usage Information
export async function getAiProxyFreeUsage(ctx: {
	regionUrl: string;
	authorization: string;
}): Promise<AiProxyFreeUsageResponse> {
	const response = await fetch("/api/ai-proxy/free-usage", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			...(ctx.authorization ? { Authorization: ctx.authorization } : {}),
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch free usage: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	return AiProxyFreeUsageResponseSchema.parse(data);
}
