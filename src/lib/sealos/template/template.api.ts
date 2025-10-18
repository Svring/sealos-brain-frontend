"use server";

import https from "node:https";
import axios from "axios";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-server.utils";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import {
	TemplateItemSchema,
	TemplateObjectSchema,
} from "@/mvvm/sealos/template/models/template-object.model";

/**
 * Creates axios instance for template API calls
 */
async function createTemplateAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "template";
	const baseURL = `http://${serviceSubdomain}.${regionUrl}/api${
		apiVersion ? `/${apiVersion}` : ""
	}`;

	const isDevelopment = process.env.MODE === "development";
	const httpsAgent = new https.Agent({
		keepAlive: true,
		rejectUnauthorized: !isDevelopment,
	});

	return axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
			Authorization: encodeURIComponent(context.kubeconfig),
		},
		httpsAgent,
	});
}

// ============================================================================
// Template API Functions
// ============================================================================

/**
 * List all templates
 */
export const listTemplates = async (context: K8sContext) => {
	const api = await createTemplateAxios(context, "v1/template");
	const response = await api.get("/");
	return response.data.data.map((template: unknown) =>
		TemplateItemSchema.parse(template),
	);
};

/**
 * Get a specific template by name
 */
export const getTemplate = async (context: K8sContext, name: string) => {
	const api = await createTemplateAxios(context, "v1/template");
	const response = await api.get(`/${name}`);
	return TemplateObjectSchema.parse(response.data.data);
};
