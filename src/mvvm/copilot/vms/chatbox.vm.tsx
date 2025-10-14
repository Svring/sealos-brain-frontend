"use client";

import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { ChatboxView } from "../views/chatbox.view";

interface ChatboxProps {
	title?: string;
}

export const Chatbox = (props: ChatboxProps) => {
	const { title = "Chat" } = props;

	// Get copilot adapter context
	const { submitWithContext, isLoading, stop, messages } =
		useCopilotAdapterContext();

	const handleSend = (message: string) => {
		submitWithContext({
			messages: [{ type: "human", content: message }],
		});
	};

	const handleStop = () => {
		stop();
	};

	return (
		<ChatboxView
			title={title}
			messages={messages}
			isLoading={isLoading}
			onSend={handleSend}
			onStop={handleStop}
		/>
	);
};
