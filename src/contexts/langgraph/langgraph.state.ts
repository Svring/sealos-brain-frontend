"use client";

import { assign, createMachine } from "xstate";

// LangGraph context interface
export interface LangGraphContext {
	base_url: string;
	api_key: string;
	model_name: string;
	agent: string;
}

export type LangGraphEvent =
	| { type: "SET_CONFIG"; base_url: string; api_key: string; model_name: string; agent: string }
	| { type: "SET_MODEL_NAME"; model_name: string }
	| { type: "SET_AGENT"; agent: string }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const langgraphMachine = createMachine({
	types: {} as {
		context: LangGraphContext;
		events: LangGraphEvent;
	},
	id: "langgraph",
	initial: "initializing",
	context: {
		base_url: "",
		api_key: "",
		model_name: "gpt-4",
		agent: "default",
	},
	states: {
		initializing: {
			on: {
				SET_CONFIG: {
					target: "ready",
					actions: assign({
						base_url: ({ event }) => event.base_url,
						api_key: ({ event }) => event.api_key,
						model_name: ({ event }) => event.model_name,
						agent: ({ event }) => event.agent,
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_MODEL_NAME: {
					actions: assign({
						model_name: ({ event }) => event.model_name,
					}),
				},
				SET_AGENT: {
					actions: assign({
						agent: ({ event }) => event.agent,
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		failed: {
			on: {
				RETRY: "initializing",
			},
		},
	},
});
