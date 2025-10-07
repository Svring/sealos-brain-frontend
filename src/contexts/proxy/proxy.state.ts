"use client";

import { assign, createMachine } from "xstate";

// Proxy context interface
export interface ProxyContext {
	base_url: string;
	api_key: string;
	model_name: string;
}

export type ProxyEvent =
	| { type: "SET_CONFIG"; base_url: string; api_key: string; model_name: string }
	| { type: "SET_MODEL_NAME"; model_name: string }
	| { type: "FAIL" }
	| { type: "RETRY" };

export const proxyMachine = createMachine({
	types: {} as {
		context: ProxyContext;
		events: ProxyEvent;
	},
	id: "proxy",
	initial: "initializing",
	context: {
		base_url: "",
		api_key: "",
		model_name: "gpt-4",
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
