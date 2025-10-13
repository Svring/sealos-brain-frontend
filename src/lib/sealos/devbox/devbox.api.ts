"use server";

import https from "node:https";
import axios from "axios";
import { composeObjectFromTarget } from "@/lib/bridge/bridge-query.api";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-server.utils";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import { DevboxBridgeSchema } from "@/mvvm/sealos/devbox/models/devbox-bridge.model";
import type { DevboxCreateData } from "@/mvvm/sealos/devbox/models/devbox-create.model";
import type { DevboxUpdateData } from "@/mvvm/sealos/devbox/models/devbox-update.model";

/**
 * Creates axios instance for devbox API calls
 */
async function createDevboxAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "devbox";
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
// DevBox API Functions
// ============================================================================

/**
 * List all devboxes
 */
export const listDevboxes = async (_context: K8sContext) => {
	// TODO: Implement list devboxes
	throw new Error("Not implemented");
};

/**
 * Get a specific devbox by CustomResourceTarget
 */
export const getDevbox = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	return await composeObjectFromTarget(context, target, DevboxBridgeSchema);
};

/**
 * Get devbox monitor data
 */
export const getDevboxMonitorData = async (
	context: K8sContext,
	queryKey: string,
	queryName: string,
	step: string = "2m",
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get("/monitor/getMonitorData", {
		params: {
			queryKey,
			queryName,
			step,
		},
	});
	return response.data.data;
};

/**
 * Check devbox ready status
 */
export const checkDevboxReady = async (
	context: K8sContext,
	devboxName: string,
) => {
	const api = await createDevboxAxios(context);
	const response = await api.get("/checkReady", {
		params: {
			devboxName,
		},
	});
	return response.data.data;
};

/**
 * Get devbox releases
 */
export const getDevboxReleases = async (
	context: K8sContext,
	devboxName: string,
) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.get(`/${devboxName}/release`);
	return response.data.data;
};

/**
 * Get devbox templates
 */
export const getDevboxTemplates = async (context: K8sContext) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.get("/templates");
	return response.data.data;
};

/**
 * Authenticate CNAME
 */
export const authCname = async (
	context: K8sContext,
	publicDomain: string,
	customDomain: string,
) => {
	const api = await createDevboxAxios(context);
	const cleanPublicDomain = publicDomain?.replace(/^https?:\/\//, "") || "";
	const response = await api.post("/platform/authCname", {
		publicDomain: cleanPublicDomain,
		customDomain,
	});
	return response.data;
};

/**
 * Create devbox
 */
export const createDevbox = async (
	context: K8sContext,
	input: DevboxCreateData,
) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post("/", input);
	return response.data;
};

/**
 * Update devbox
 */
export const updateDevbox = async (
	context: K8sContext,
	input: DevboxUpdateData,
) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.patch(`/${input.name}`, input);
	return response.data;
};

/**
 * Start devbox
 */
export const startDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${name}/start`, {});
	return response.data;
};

/**
 * Pause devbox
 */
export const pauseDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${name}/pause`, {});
	return response.data;
};

/**
 * Shutdown devbox
 */
export const shutdownDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${name}/shutdown`, {});
	return response.data;
};

/**
 * Restart devbox
 */
export const restartDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${name}/restart`, {});
	return response.data;
};

/**
 * Autostart devbox
 */
export const autostartDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${name}/autostart`, {});
	return response.data;
};

/**
 * Delete devbox
 */
export const deleteDevbox = async (context: K8sContext, name: string) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.delete(`/${name}/delete`);
	return response.data;
};

/**
 * Release devbox
 */
export const releaseDevbox = async (
	context: K8sContext,
	devboxName: string,
	tag: string,
	releaseDes: string = "",
) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const request = {
		tag,
		releaseDes,
	};
	const response = await api.post(`/${devboxName}/release`, request);
	return response.data;
};

/**
 * Delete devbox release
 */
export const deleteDevboxRelease = async (
	context: K8sContext,
	releaseName: string,
) => {
	const api = await createDevboxAxios(context);
	const response = await api.delete("/delDevboxVersionByName", {
		params: {
			versionName: releaseName,
		},
	});
	return { data: response.data.data };
};

/**
 * Deploy devbox
 */
export const deployDevbox = async (
	context: K8sContext,
	devboxName: string,
	tag: string,
) => {
	const api = await createDevboxAxios(context, "v1/devbox");
	const response = await api.post(`/${devboxName}/release/${tag}/deploy`, {});
	return response.data;
};
