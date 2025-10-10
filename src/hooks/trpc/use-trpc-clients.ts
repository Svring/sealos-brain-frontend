import { instanceClient, k8sClient } from "@/components/configs/query-trpc.config";

export const useTRPCClients = () => {
	const k8sTrpcClient = k8sClient.useTRPC();
	const instanceTrpcClient = instanceClient.useTRPC();

	return {
		k8s: k8sTrpcClient,
		instance: instanceTrpcClient,
	};
};
