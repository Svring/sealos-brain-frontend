export const DEVBOX_LABELS = {
	/** Label used for devbox-related resources like backups in devbox deletion */
	// ingress, service
	DEVBOX_MANAGER: "cloud.sealos.io/devbox-manager",
	// secret, pod
	APP_KUBERNETES_NAME: "app.kubernetes.io/name",
} as const;
