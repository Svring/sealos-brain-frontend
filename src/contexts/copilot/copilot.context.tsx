"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Chat, copilotMachine } from "./copilot.state";

interface CopilotMachineContextValue {
	chats: Chat[];
	opened: boolean;
	state: StateFrom<typeof copilotMachine>;
	send: (event: EventFrom<typeof copilotMachine>) => void;
}

export const copilotMachineContext = createContext<
	CopilotMachineContextValue | undefined
>(undefined);

export function useCopilotMachineContext() {
	const ctx = use(copilotMachineContext);
	if (!ctx) {
		throw new Error(
			"useCopilotMachineContext must be used within a CopilotMachineProvider",
		);
	}
	return ctx;
}

export function useCopilotState() {
	const { state } = useCopilotMachineContext();

	return {
		chats: state.context.chats,
		opened: state.context.opened,
		isIdle: state.matches("idle"),
	};
}

export function useCopilotEvents() {
	const { send } = useCopilotMachineContext();

	return {
		addChat: (chat: Chat) => send({ type: "ADD_CHAT", chat }),
		pushChat: (chat: Chat) => send({ type: "PUSH_CHAT", chat }),
		updateChat: (index: number, chat: Partial<Chat>) =>
			send({ type: "UPDATE_CHAT", index, chat }),
		setChats: (chats: Chat[]) => send({ type: "SET_CHATS", chats }),
		clearChats: () => send({ type: "CLEAR_CHATS" }),
		openCopilot: () => send({ type: "OPEN_COPILOT" }),
		closeCopilot: () => send({ type: "CLOSE_COPILOT" }),
		toggleCopilot: () => send({ type: "TOGGLE_COPILOT" }),
	};
}
