"use client";

import type { CustomResourceTarget } from "@/mvvm/k8s/models/k8s-custom.model";

import { useInstanceResources } from "../instance/use-instance-resources";
import { useResourceObjects } from "../resource/use-resource-objects";

export const useFlow = (instance: CustomResourceTarget) => {
	const { data: resources } = useInstanceResources(instance);

	const { data: objects } = useResourceObjects(resources || []);

	// return { objects };
};
