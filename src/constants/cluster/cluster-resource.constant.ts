// CPU options as numbers for cluster resources
export const CLUSTER_CPU_OPTIONS = [0.5, 1, 2, 4, 8, 16] as const;

// Memory options as numbers for cluster resources (includes 32 GB)
export const CLUSTER_MEMORY_OPTIONS = [0.5, 1, 2, 4, 8, 16, 32] as const;

// Storage options as numbers for cluster resources
export const CLUSTER_STORAGE_OPTIONS = [1, 5, 10, 20, 50, 100, 200, 300] as const;

// Replicas options for cluster resources
export const CLUSTER_REPLICAS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type ClusterCpuOption = (typeof CLUSTER_CPU_OPTIONS)[number];
export type ClusterMemoryOption = (typeof CLUSTER_MEMORY_OPTIONS)[number];
export type ClusterStorageOption = (typeof CLUSTER_STORAGE_OPTIONS)[number];
export type ClusterReplicasOption = (typeof CLUSTER_REPLICAS_OPTIONS)[number];
