"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { ChatboxView } from "../views/chatbox.view";

interface ChatboxProps {
	title?: string;
	messages?: Message[];
	isLoading?: boolean;
	autoFocus?: boolean;
	disableInput?: boolean;
	disableSend?: boolean;
	exhibition?: boolean;
}

export const Chatbox = (props: ChatboxProps) => {
	const {
		title = "Chat",
		messages = [],
		isLoading = false,
		autoFocus = false,
		disableInput = false,
		disableSend = false,
		exhibition = false,
	} = props;

	// Empty function implementations for now
	const handleSend = (message: string) => {
		// TODO: Implement send message logic
		console.log("Send message:", message);
	};

	const handleStop = () => {
		// TODO: Implement stop logic
		console.log("Stop");
	};

	return (
		<ChatboxView
			title={title}
			messages={messages}
			isLoading={isLoading}
			onSend={handleSend}
			onStop={handleStop}
			autoFocus={autoFocus}
			disableInput={disableInput}
			disableSend={disableSend}
			exhibition={exhibition}
		/>
	);
};
