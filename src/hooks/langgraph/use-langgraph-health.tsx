"use client";

import { useMount } from "@reactuses/core";
import { toast } from "sonner";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";
import { checkGraphStatus } from "@/lib/langgraph/langgraph.utils";

export function useLangGraphHealth() {
	const { deploymentUrl } = useLangGraphState();

	useMount(() => {
		if (deploymentUrl) {
			checkGraphStatus(deploymentUrl).then((ok) => {
				if (!ok) {
					toast.error("Failed to connect to LangGraph server", {
						description: `Please ensure your graph is running at ${deploymentUrl}`,
						duration: 5000,
					});
				}
			});
		}
	});
}
