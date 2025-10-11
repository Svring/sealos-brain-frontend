import type { ClusterResource } from "@/mvvm/sealos/cluster/models/cluster-resource.model";

export interface ClusterItem extends Record<string, unknown> {
	name: string;
	uid: string;
	type: string;
	resourceType: "cluster";
}

export const clusterParser = {
	toItem: (resource: ClusterResource): ClusterItem => {
		return {
			name: resource.metadata.name,
			uid: resource.metadata.uid,
			type: resource.spec.clusterDefinitionRef,
			resourceType: "cluster" as const,
		};
	},
};
