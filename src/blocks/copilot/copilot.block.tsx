"use client";

import * as Copilot from "@/components/copilot/copilot.comp";
import { CopilotAdapter } from "@/contexts/copilot/copilot.adapter";
import {
	useCopilotMachineContext,
	useCopilotState,
} from "@/contexts/copilot/copilot.context";
import { ChatBlock } from "./chat/chat.block";

export function CopilotBlock() {
	const { state, send } = useCopilotMachineContext();
	const { chats } = useCopilotState();

	const context = {
		chats: state.context.chats,
		opened: state.context.opened,
		view: state.context.view,
		state,
		send,
	};

	// If no chats, show a single empty chatbox
	if (chats.length === 0) {
		return (
			<Copilot.Root context={context}>
				<Copilot.Content>
					<CopilotAdapter metadata={{}}>
						<ChatBlock />
					</CopilotAdapter>
				</Copilot.Content>
			</Copilot.Root>
		);
	}

	// Render all chats with their metadata
	return (
		<Copilot.Root context={context}>
			<Copilot.Content>
				{chats.map((chat, index) => (
					<CopilotAdapter key={index} metadata={chat.metadata}>
						<ChatBlock
							metadata={chat.metadata}
							index={index}
							totalChats={chats.length}
						/>
					</CopilotAdapter>
				))}
			</Copilot.Content>
		</Copilot.Root>
	);
}
