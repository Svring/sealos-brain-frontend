import { INSTANCE_DISPLAY_NAME_ANNOTATION_KEY } from "@/constants/instance/instance.constant";
import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";
import type { InstanceObject } from "@/mvvm/sealos/instance/models/instance-object.model";
import type { InstanceResource } from "@/mvvm/sealos/instance/models/instance-resource.model";

// Convert InstanceResource to InstanceObject
const toObject = (instance: InstanceResource): InstanceObject => {
	const { metadata } = instance;

	// Get display name from annotations or fallback to name
	const displayName =
		metadata.annotations?.[INSTANCE_DISPLAY_NAME_ANNOTATION_KEY] ||
		metadata.name;

	return {
		name: metadata.name || "unknown",
		uid: metadata.uid || "",
		resourceType: "instance",
		displayName,
		createdAt: metadata.creationTimestamp || "",
	};
};

// Convert array of InstanceResource to array of InstanceObject
const toObjects = (instances: InstanceResource[]): InstanceObject[] => {
	return instances
		.map(toObject)
		.filter((instance) => instance.name !== "unknown");
};

// Convert InstanceResource or name to target for API operations
const toTarget = (input: InstanceResource | string): CustomResourceTarget => {
	const name = typeof input === "string" ? input : input.metadata.name;
	return {
		type: "custom",
		resourceType: "instance",
		name,
	};
};

// Convert array of InstanceResource to targets
const toTargets = (instances: InstanceResource[]): CustomResourceTarget[] => {
	return instances.map(toTarget);
};

export const instanceParser = {
	toObject,
	toObjects,
	toTarget,
	toTargets,
};
