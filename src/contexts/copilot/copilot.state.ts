"use client";

import type { Thread } from "@langchain/langgraph-sdk";
import { assign, createMachine } from "xstate";

// Chat object interface
export interface Chat {
	metadata: Record<string, string>;
	threads: Thread[];
	activeThreadId: string;
}

// Copilot context interface
export interface CopilotContext {
	chats: Chat[];
}

export type CopilotEvent =
	| { type: "ADD_CHAT"; chat: Chat }
	| { type: "PUSH_CHAT"; chat: Chat }
	| { type: "UPDATE_CHAT"; index: number; chat: Partial<Chat> }
	| { type: "SET_CHATS"; chats: Chat[] }
	| { type: "CLEAR_CHATS" };

export const copilotMachine = createMachine({
	types: {} as {
		context: CopilotContext;
		events: CopilotEvent;
	},
	id: "copilot",
	initial: "idle",
	context: {
		chats: [],
	},
	states: {
		idle: {
			on: {
				ADD_CHAT: {
					actions: assign({
						chats: ({ context, event }) => [...context.chats, event.chat],
					}),
				},
				PUSH_CHAT: {
					actions: assign({
						chats: ({ context, event }) => [event.chat, ...context.chats],
					}),
				},
				UPDATE_CHAT: {
					actions: assign({
						chats: ({ context, event }) =>
							context.chats.map((chat, index) =>
								index === event.index ? { ...chat, ...event.chat } : chat,
							),
					}),
				},
				SET_CHATS: {
					actions: assign({ chats: ({ event }) => event.chats }),
				},
				CLEAR_CHATS: {
					actions: assign({ chats: [] }),
				},
			},
		},
	},
});
