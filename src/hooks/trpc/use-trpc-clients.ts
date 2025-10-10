import { aiProxyClient, devboxClient, instanceClient, k8sClient } from "@/components/configs/query-trpc.config";

export const useTRPCClients = () => {
	const k8sTrpcClient = k8sClient.useTRPC();
	const instanceTrpcClient = instanceClient.useTRPC();
	const devboxTrpcClient = devboxClient.useTRPC();
	const aiProxyTrpcClient = aiProxyClient.useTRPC();

	return {
		k8s: k8sTrpcClient,
		instance: instanceTrpcClient,
		devbox: devboxTrpcClient,
		aiProxy: aiProxyTrpcClient,
	};
};
