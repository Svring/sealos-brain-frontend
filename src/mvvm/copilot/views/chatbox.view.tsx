"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { InputBox } from "../vms/input-box.vm";
import { MessagesView } from "./messages.view";

interface ChatboxViewProps {
	// Header props
	title?: string;
	// Messages props
	messages: Message[];
	isLoading: boolean;
	// Input box props
	onSend?: (message: string) => void;
	onStop?: () => void;
	autoFocus?: boolean;
	disableInput?: boolean;
	disableSend?: boolean;
	exhibition?: boolean;
}

export function ChatboxView(props: ChatboxViewProps) {
	const {
		title = "Chat",
		messages,
		isLoading,
		onSend,
		onStop,
		autoFocus,
		disableInput,
		disableSend,
		exhibition,
	} = props;

	return (
		<div className="h-full w-full flex flex-col bg-background-secondary border rounded-lg">
			{/* Header */}
			<div className="px-4 pt-2 shrink-0 bg-transparent">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						<h2 className="font-semibold text-foreground text-lg shrink-0">
							{title}
						</h2>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
				<MessagesView messages={messages} isLoading={isLoading} />
			</div>

			{/* Input Box */}
			<div className="p-2 pt-0 shrink-0 relative z-[9999]">
				<div className="max-w-3xl mx-auto">
					<InputBox
						onSend={onSend}
						onStop={onStop}
						isLoading={isLoading}
						autoFocus={autoFocus}
						disableInput={disableInput}
						disableSend={disableSend}
						exhibition={exhibition}
					/>
				</div>
			</div>
		</div>
	);
}
