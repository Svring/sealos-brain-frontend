"use server";

import { transformMonitorData } from "@/lib/resource/resource.utils";
import type { K8sContext } from "@/mvvm/k8s/models/k8s-context.model";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { MonitorData } from "@/mvvm/resource/models/resource-monitor.model";
import { getDevboxMonitorData } from "./devbox.api";

// ============================================================================
// DevBox Service Functions (Higher-level business logic)
// ============================================================================

/**
 * Get devbox combined monitor
 */
export const getDevboxMonitor = async (
	context: K8sContext,
	target: CustomResourceTarget,
) => {
	const [cpuResult, memoryResult] = await Promise.allSettled([
		getDevboxMonitorData(context, "average_cpu", target.name),
		getDevboxMonitorData(context, "average_memory", target.name),
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
