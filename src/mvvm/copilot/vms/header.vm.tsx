"use client";

import { useCopilotEvents } from "@/contexts/copilot/copilot.context";
import { HeaderView } from "../views/header.view";

interface HeaderProps {
	title?: string;
	isCreatingThread?: boolean;
	isMaximized?: boolean;
	showFocusToggle?: boolean;
	threads?: Array<{
		thread_id: string;
		title?: string;
		updated_at?: string;
	}>;
	currentThreadId?: string;
}

export const Header = (props: HeaderProps) => {
	const {
		title = "Chat",
		isCreatingThread = false,
		isMaximized = false,
		showFocusToggle = false,
		threads = [],
		currentThreadId,
	} = props;
  
  const { close } = useCopilotEvents();

	// Empty function implementations
	const handleNewChat = () => {
		console.log("New chat clicked");
	};

	const handleClose = () => {
		close();
	};

	const handleFocusToggle = (pressed: boolean) => {
		console.log("Focus toggle:", pressed);
	};

	const handleThreadSelect = (threadId: string) => {
		console.log("Thread selected:", threadId);
	};

	return (
		<HeaderView
			title={title}
			onNewChat={handleNewChat}
			onClose={handleClose}
			onFocusToggle={handleFocusToggle}
			onThreadSelect={handleThreadSelect}
			isCreatingThread={isCreatingThread}
			isMaximized={isMaximized}
			showFocusToggle={showFocusToggle}
			threads={threads}
			currentThreadId={currentThreadId}
		/>
	);
};
