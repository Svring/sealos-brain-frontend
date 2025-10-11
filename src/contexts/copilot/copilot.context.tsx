"use client";

import { createContext, use } from "react";
import type { EventFrom, StateFrom } from "xstate";
import type { Chat, copilotMachine } from "./copilot.state";

interface CopilotContextValue {
	chats: Chat[];
	state: StateFrom<typeof copilotMachine>;
	send: (event: EventFrom<typeof copilotMachine>) => void;
}

export const copilotMachineContext = createContext<CopilotContextValue | undefined>(
	undefined,
);

export function useCopilotContext() {
	const ctx = use(copilotMachineContext);
	if (!ctx) {
		throw new Error("useCopilotContext must be used within CopilotAdapter");
	}
	return ctx;
}

export function useCopilotState() {
	const { state } = useCopilotContext();
	
	return {
		chats: state.context.chats,
		isIdle: state.matches("idle"),
	};
}

export function useCopilotEvents() {
	const { send } = useCopilotContext();

	return {
		addChat: (chat: Chat) => send({ type: "ADD_CHAT", chat }),
		pushChat: (chat: Chat) => send({ type: "PUSH_CHAT", chat }),
		updateChat: (index: number, chat: Partial<Chat>) => send({ type: "UPDATE_CHAT", index, chat }),
		setChats: (chats: Chat[]) => send({ type: "SET_CHATS", chats }),
		clearChats: () => send({ type: "CLEAR_CHATS" }),
	};
}
