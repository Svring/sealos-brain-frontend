// Label constants
export const INSTANCE_LABELS = {
	/** Label used for direct affiliated resources */
	DEPLOY_ON_SEALOS: "cloud.sealos.io/deploy-on-sealos",
} as const;

export const DEPLOYMENT_LABELS = {
	// Ingress, Service, Pvc, Configmap, Issuer, certificate
	APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
	// Pod and ReplicaSet
	APP: "app",
} as const;

export const STATEFULSET_LABELS = {
	// Ingress, Service, Pvc, Configmap, Issuer, certificate
	APP_DEPLOY_MANAGER: "cloud.sealos.io/app-deploy-manager",
	// Pod and ReplicaSet
	APP: "app",
} as const;

export const DEVBOX_LABELS = {
	/** Label used for devbox-related resources like backups in devbox deletion */
	// ingress, service
	DEVBOX_MANAGER: "cloud.sealos.io/devbox-manager",
	// secret, pod
	APP_KUBERNETES_NAME: "app.kubernetes.io/name",
} as const;

export const CLUSTER_LABELS = {
	/** Label used for cluster-related resources like backups in cluster deletion */
	APP_KUBERNETES_INSTANCE: "app.kubernetes.io/instance",
} as const;
