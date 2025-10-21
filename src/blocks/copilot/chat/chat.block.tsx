"use client";

import { useState } from "react";
import * as Chat from "@/components/copilot/chat.comp";
import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";

interface ChatBlockProps {
	metadata?: Record<string, string>;
}

export function ChatBlock({ metadata = {} }: ChatBlockProps) {
	const { submitWithContext, stop, isLoading } = useCopilotAdapterContext();
	const [value, setValue] = useState("");

	const handleSubmit = () => {
		if (value.trim()) {
			submitWithContext({
				messages: [{ type: "human", content: value }],
			});
			setValue("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleSendClick = () => {
		if (isLoading) {
			stop();
		} else {
			handleSubmit();
		}
	};

	return (
		<Chat.Root metadata={metadata}>
			<Chat.Container>
				{/* Header Section */}
				<Chat.Header>
					<div className="flex items-center">
						<Chat.Title />
						<Chat.ViewToggle />
					</div>

					<div className="flex items-center gap-1">
						<Chat.NewChat />
						<Chat.History />
						<Chat.Close />
					</div>
				</Chat.Header>

				{/* Content Section - Messages */}
				<Chat.Content>
					<Chat.Messages>
						<Chat.AIMessage data-message-role="ai" />
						<Chat.HumanMessage data-message-role="human" />
						<Chat.ToolMessage data-message-role="tool" />
						<Chat.SystemMessage data-message-role="system" />
					</Chat.Messages>
				</Chat.Content>

				{/* Footer Section - Input */}
				<Chat.Footer>
					<div className="rounded-lg border bg-background-tertiary p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 focus-within:border-border-primary flex flex-col">
						<Chat.TextArea
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={handleKeyDown}
							disabled={isLoading}
						/>
						<Chat.Send
							onClick={handleSendClick}
							canSend={!!value.trim() || isLoading}
						/>
					</div>
				</Chat.Footer>
			</Chat.Container>
		</Chat.Root>
	);
}
