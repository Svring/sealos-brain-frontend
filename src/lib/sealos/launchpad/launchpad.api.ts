"use server";

import https from "node:https";
import axios from "axios";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-server.utils";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { LaunchpadCreateData } from "@/mvvm/sealos/launchpad/models/launchpad-create.model";
import type { LaunchpadUpdateData } from "@/mvvm/sealos/launchpad/models/launchpad-update.model";

/**
 * Creates axios instance for launchpad API calls
 */
async function createLaunchpadAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "applaunchpad";
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
// Launchpad API Functions
// ============================================================================

/**
 * List all launchpads
 */
export const listLaunchpads = async (context: K8sContext) => {
	// TODO: Implement list launchpads
	throw new Error("Not implemented");
};

/**
 * Get a specific launchpad by CustomResourceTarget
 */
export const getLaunchpad = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	// TODO: Implement get launchpad
	throw new Error("Not implemented");
};

/**
 * Get launchpad combined monitor
 */
export const getLaunchpadCombinedMonitor = async (
	context: K8sContext,
	queryName: string,
	step: string = "2m",
) => {
	// TODO: Implement get launchpad combined monitor
	throw new Error("Not implemented");
};

/**
 * Check launchpad ready status
 */
export const checkLaunchpadReady = async (
	context: K8sContext,
	queryName: string,
) => {
	// TODO: Implement check launchpad ready
	throw new Error("Not implemented");
};

/**
 * Get launchpad logs
 */
export const getLaunchpadLogs = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	// TODO: Implement get launchpad logs
	throw new Error("Not implemented");
};

/**
 * Get launchpad application pods
 */
export const getLaunchpadApplicationPods = async (
	context: K8sContext,
	name: string,
) => {
	// TODO: Implement get launchpad application pods
	throw new Error("Not implemented");
};

/**
 * Get launchpad pods metrics
 */
export const getLaunchpadPodsMetrics = async (
	context: K8sContext,
	name: string,
) => {
	// TODO: Implement get launchpad pods metrics
	throw new Error("Not implemented");
};

/**
 * Create launchpad
 */
export const createLaunchpad = async (
	context: K8sContext,
	input: LaunchpadCreateData,
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post("/app", input);
	return response.data;
};

/**
 * Update launchpad
 */
export const updateLaunchpad = async (
	context: K8sContext,
	input: LaunchpadUpdateData,
) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.patch(`/app/${input.name}`, input);
	return response.data;
};

/**
 * Start launchpad
 */
export const startLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/start`, {});
	return response.data;
};

/**
 * Pause launchpad
 */
export const pauseLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/pause`, {});
	return response.data;
};

/**
 * Restart launchpad
 */
export const restartLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.post(`/app/${name}/restart`, {});
	return response.data;
};

/**
 * Delete launchpad
 */
export const deleteLaunchpad = async (context: K8sContext, name: string) => {
	const api = await createLaunchpadAxios(context, "v1");
	const response = await api.delete(`/app/${name}`);
	return response.data;
};
