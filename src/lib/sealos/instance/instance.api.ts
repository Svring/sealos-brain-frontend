"use server";

import https from "node:https";
import axios from "axios";
import _ from "lodash";
import { INSTANCE_LABELS } from "@/constants/instance/instance-labels.constant";
import { k8sParser } from "@/lib/k8s/k8s.parser";
import { getRegionUrlFromKubeconfig } from "@/lib/k8s/k8s-server.utils";
import {
	getResource,
	listResources,
	selectResources,
} from "@/lib/k8s/k8s-service.api";
import { resourceParser } from "@/lib/resource/resource.parser";
import { instanceParser } from "@/lib/sealos/instance/instance.parser";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { K8sItem } from "@/mvvm/k8s/models/k8s-resource.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";
import { InstanceResourceSchema } from "@/mvvm/sealos/instance/models/instance-resource.model";

/**
 * Creates axios instance for instance API calls
 */
async function createInstanceAxios(context: K8sContext, apiVersion?: string) {
	const regionUrl = await getRegionUrlFromKubeconfig(context.kubeconfig);
	if (!regionUrl) {
		throw new Error("Failed to extract region URL from kubeconfig");
	}

	const serviceSubdomain = "template";
	const baseURL = `https://${serviceSubdomain}.${regionUrl}/api${
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
// Instance API Functions
// ============================================================================

/**
 * List all instances
 */
export const listInstances = async (context: K8sContext) => {
	const instanceTarget = k8sParser.fromTypeToTarget("instance");
	const instanceList = await listResources(context, instanceTarget);

	// Convert raw K8s resources to instance objects using parser
	if (instanceList.items && instanceList.items.length > 0) {
		const validatedInstances = _.filter(
			instanceList.items,
			(instance) =>
				instance?.spec?.url !==
				"https://github.com/nightwhite/own-sealos-templates",
		).map((rawInstance: unknown) => {
			// Validate and parse the instance using our schema
			return InstanceResourceSchema.parse(rawInstance);
		});

		// Convert to instance objects using parser
		return instanceParser.toObjects(validatedInstances);
	}

	return [];
};

/**
 * Get a specific instance by CustomResourceTarget
 */
export const getInstance = async (
	context: K8sContext,
	target: CustomResourceTarget,
): Promise<InstanceObject> => {
	const instanceResource = await getResource(context, target);

	// Validate and parse the instance using our schema
	const validatedInstance = InstanceResourceSchema.parse(instanceResource);

	// Convert to instance object using parser
	return instanceParser.toObject(validatedInstance);
};

/**
 * Get instance resources (related resources with instance label)
 */
export const getInstanceResources = async (
	context: K8sContext,
	target: CustomResourceTarget,
): Promise<K8sItem[]> => {
	const targets = [
		{
			type: "builtin" as const,
			resourceType: "deployment" as const,
			name: target.name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "builtin" as const,
			resourceType: "statefulset" as const,
			name: target.name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "devbox" as const,
			name: target.name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "cluster" as const,
			name: target.name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
		{
			type: "custom" as const,
			resourceType: "objectstoragebucket" as const,
			name: target.name,
			label: INSTANCE_LABELS.DEPLOY_ON_SEALOS,
		},
	];

	const selectedResources = await selectResources(context, targets);

	// Convert resources to items using resourceParser
	return resourceParser.toItems(selectedResources);
};

/**
 * Delete instance
 */
export const deleteInstance = async (
	context: K8sContext,
	instanceName: string,
) => {
	const api = await createInstanceAxios(context, "v1/instance");
	const response = await api.delete(`/${instanceName}`, {});
	return response.data;
};
