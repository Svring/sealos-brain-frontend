import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { DevboxResource } from "@/mvvm/sealos/devbox/models/devbox-resource.model";

export interface DevboxItem extends Record<string, unknown> {
	name: string;
	uid: string;
	runtime: string;
	resourceType: "devbox";
}

const toItem = (resource: DevboxResource): DevboxItem => {
	// Extract runtime from image similar to DevboxBridgeSchema
	const image = resource.spec.image || "";
	// @ts-expect-error
	const imageName = image.split(":")[0].split("/").pop() || "";
	const runtime = imageName.split("-").slice(0, 1).join("-");

	return {
		name: resource.metadata.name,
		uid: resource.metadata.uid,
		runtime,
		resourceType: "devbox" as const,
	};
};

const toTarget = (input: DevboxResource | string): CustomResourceTarget => {
	const name = typeof input === "string" ? input : input.metadata.name;
	return {
		type: "custom",
		resourceType: "devbox",
		name,
	};
};

const toItems = (resources: DevboxResource[]): DevboxItem[] => {
	return resources.map(toItem);
};

const toTargets = (resources: DevboxResource[]): CustomResourceTarget[] => {
	return resources.map(toTarget);
};

export const devboxParser = {
	toItem,
	toTarget,
	toItems,
	toTargets,
};
