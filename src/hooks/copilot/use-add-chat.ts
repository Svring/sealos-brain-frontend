"use client";

import { useAuthState } from "@/contexts/auth/auth.context";
import {
	useCopilotEvents,
	useCopilotState,
} from "@/contexts/copilot/copilot.context";
import { composeMetadata } from "@/lib/langgraph/langgraph.utils";

/**
 * Hook to add or toggle chat with project and resource metadata
 * @returns Object with handleAddChat function and current chat state
 */
export const useAddChat = () => {
	const { auth } = useAuthState();
	const { chats, opened } = useCopilotState();
	const { addChat, close } = useCopilotEvents();

	const handleAddChat = (projectId?: string, resourceId?: string) => {
		if (!projectId) {
			console.warn("Project ID is required to add chat");
			return;
		}

		const newMetadata = composeMetadata(
			auth?.kubeconfigEncoded,
			projectId,
			resourceId,
		);
		const latestChat = chats[chats.length - 1];

		// Check if the latest chat has the same metadata
		if (
			latestChat &&
			opened &&
			JSON.stringify(latestChat.metadata) === JSON.stringify(newMetadata)
		) {
			close();
		} else {
			addChat({
				metadata: newMetadata,
			});
		}
	};

	return {
		handleAddChat,
		chats,
		opened,
		addChat,
		close,
	};
};
