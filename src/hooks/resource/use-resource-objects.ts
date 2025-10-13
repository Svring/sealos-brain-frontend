"use client";

import { resourceParser } from "@/lib/resource/resource.parser";
import type {
	K8sItem,
	K8sResource,
} from "@/mvvm/k8s/models/k8s-resource.model";

export const useResourceObjects = (resources: K8sItem[] | K8sResource[]) => {
	const targets = resourceParser.toTargets(resources);
	console.log("Resource targets:", targets);
  
	return {
		data: targets,
	};
};
