import { INSTANCE_DISPLAY_NAME_ANNOTATION_KEY } from "@/constants/instance/instance.constant";
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

export const instanceParser = {
	toObject,
	toObjects,
};
