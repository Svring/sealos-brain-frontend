import { k8sClient } from "@/components/configs/query-trpc.config";

export const useTRPCClients = () => {
	const k8sTrpcClient = k8sClient.useTRPC();

	return {
		k8s: k8sTrpcClient,
	};
};
