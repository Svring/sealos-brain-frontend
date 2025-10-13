"use client";

import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { PageView } from "../views/page.view";

export const Page = () => {
	// Get copilot adapter context
	const { submitWithContext, isLoading, stop, messages, hasMessages } =
		useCopilotAdapterContext();

	const handleSubmit = (message: string) => {
		submitWithContext({
			messages: [{ type: "human", content: message }],
		});
	};

	const handleStop = () => {
		stop();
	};

	const handleOpenTemplate = () => {
		console.log("Open template dialog");
	};

	return (
		<PageView
			messages={messages}
			isLoading={isLoading}
			hasMessages={hasMessages}
			onSubmit={handleSubmit}
			onStop={handleStop}
			onOpenTemplate={handleOpenTemplate}
		/>
	);
};
