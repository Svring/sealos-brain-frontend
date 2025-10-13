"use server";

import { transformMonitorData } from "@/lib/resource/resource.utils";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { MonitorData } from "@/mvvm/resource/models/resource-monitor.model";
import { getClusterMonitorData } from "./cluster.api";

// ============================================================================
// Cluster Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get cluster combined monitor
 */
export const getClusterMonitor = async (
	context: K8sContext,
	dbName: string,
	dbType: string,
) => {
	const [cpuResult, memoryResult, diskResult] = await Promise.allSettled([
		getClusterMonitorData(context, dbName, dbType, "cpu"),
		getClusterMonitorData(context, dbName, dbType, "memory"),
		getClusterMonitorData(context, dbName, dbType, "disk"),
	]);

	const cpuData =
		cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
	const memoryData =
		memoryResult.status === "fulfilled" ? memoryResult.value : undefined;
	const storageData =
		diskResult.status === "fulfilled" ? diskResult.value : undefined;

	// Transform combined monitor data
	const monitorData: MonitorData = {
		cpu: cpuData ? { data: cpuData } : undefined,
		memory: memoryData ? { data: memoryData } : undefined,
		storage: storageData ? { data: storageData } : undefined,
	};

	return transformMonitorData(monitorData);
};
