import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { aiProxyRouter, useAiProxyContext } from "@/trpc/ai-proxy.trpc";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc/ai-proxy",
		req,
		router: aiProxyRouter,
		createContext: useAiProxyContext,
	});

export { handler as GET, handler as POST };
