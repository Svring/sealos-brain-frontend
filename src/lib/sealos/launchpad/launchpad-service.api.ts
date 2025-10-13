"use server";

import { transformMonitorData } from "@/lib/resource/resource.utils";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { MonitorData } from "@/mvvm/resource/models/resource-monitor.model";
import { getLaunchpadMonitorData } from "./launchpad.api";

// ============================================================================
// Launchpad Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get launchpad combined monitor
 */
export const getLaunchpadMonitor = async (
	context: K8sContext,
	queryName: string,
	step: string = "2m",
) => {
	const [cpuResult, memoryResult] = await Promise.allSettled([
		getLaunchpadMonitorData(context, "average_cpu", queryName, step),
		getLaunchpadMonitorData(context, "average_memory", queryName, step),
	]);

	const cpuData =
		cpuResult.status === "fulfilled" ? cpuResult.value : undefined;
	const memoryData =
		memoryResult.status === "fulfilled" ? memoryResult.value : undefined;

	// Transform combined monitor data
	const monitorData: MonitorData = {
		cpu: cpuData ? { data: cpuData } : undefined,
		memory: memoryData ? { data: memoryData } : undefined,
	};

	return transformMonitorData(monitorData);
};
