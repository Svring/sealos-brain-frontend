import type { DevboxResource } from "@/mvvm/sealos/devbox/models/devbox-resource.model";

export interface DevboxItem extends Record<string, unknown> {
	name: string;
	runtime: string;
	resourceType: "devbox";
}

export const devboxParser = {
	toItem: (resource: DevboxResource): DevboxItem => {
		// Extract runtime from image similar to DevboxBridgeSchema
		const image = resource.spec.image || "";
		const imageName = image.split(":")[0].split("/").pop() || "";
		const runtime = imageName.split("-").slice(0, 1).join("-");

		return {
			name: resource.metadata.name,
			runtime,
			resourceType: "devbox" as const,
		};
	},
};
