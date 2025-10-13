import type { BuiltinResourceTarget } from "@/mvvm/k8s/models/k8s-builtin.model";
import type { DeploymentResource } from "@/mvvm/sealos/launchpad/models/deployment/deployment-resource.model";
import type { StatefulSetResource } from "@/mvvm/sealos/launchpad/models/statefulset/statefulset-resource.model";

export interface LaunchpadItem extends Record<string, unknown> {
	name: string;
	uid: string;
	image: string;
	resourceType: "deployment" | "statefulset";
}

const toItem = (
	resource: DeploymentResource | StatefulSetResource,
): LaunchpadItem => {
	// Determine resource type and extract image
	const isDeployment = resource.kind === "Deployment";
	const resourceType = isDeployment ? "deployment" : "statefulset";

	// Extract image from containers
	let image = "";
	if (isDeployment) {
		const deployment = resource as DeploymentResource;
		image = deployment.spec.template.spec.containers[0]?.image || "";
	} else {
		const statefulset = resource as StatefulSetResource;
		image = statefulset.spec.template.spec.containers[0]?.image || "";
	}

	return {
		name: resource.metadata.name,
		uid: resource.metadata.uid,
		image,
		resourceType: resourceType as "deployment" | "statefulset",
	};
};

const toTarget = (
	input: DeploymentResource | StatefulSetResource | string,
	resourceType?: "deployment" | "statefulset",
): BuiltinResourceTarget => {
	if (typeof input === "string") {
		if (!resourceType) {
			throw new Error("Resource type must be specified when using string input");
		}
		return {
			type: "builtin",
			resourceType,
			name: input,
		};
	}
	
	const isDeployment = input.kind === "Deployment";
	const type = isDeployment ? "deployment" : "statefulset";

	return {
		type: "builtin",
		resourceType: type,
		name: input.metadata.name,
	};
};

const toItems = (
	resources: (DeploymentResource | StatefulSetResource)[],
): LaunchpadItem[] => {
	return resources.map(toItem);
};

const toTargets = (
	resources: (DeploymentResource | StatefulSetResource)[],
): BuiltinResourceTarget[] => {
	return resources.map((resource) => toTarget(resource));
};

export const launchpadParser = {
	toItem,
	toTarget,
	toItems,
	toTargets,
};
