"use client";

import type { Message } from "@langchain/langgraph-sdk";
import { assign, createMachine } from "xstate";

// Re-export Message from LangGraph SDK
export type { Message };

// Context interfaces - using any for now
export type ProjectContext = any;
export type ResourceContext = any;

// Graph State interface based on the Python TypedDict
export interface GraphState {
	base_url?: string | null;
	api_key?: string | null;
	model_name?: string | null;
	kubeconfig_encoded?: string | null;
	messages: Message[];
	route?:
		| "propose"
		| "resource"
		| "project"
		| null;
	project_context?: ProjectContext | null;
	resource_context?: ResourceContext | null;
}

// LangGraph context interface
export interface LangGraphContext {
	graphState: GraphState;
	deploymentUrl: string;
	graphId: string;
}

export type LangGraphEvent =
	| {
			type: "SET_GRAPH_STATE";
			graphState: Partial<GraphState>;
	  }
	| { type: "SET_DEPLOYMENT_URL"; deploymentUrl: string }
	| { type: "SET_GRAPH_ID"; graphId: string }
	| { type: "SET_DEPLOYMENT"; deploymentUrl: string; graphId: string }
	| { type: "UPDATE_GRAPH_STATE"; graphState: Partial<GraphState> }
	| { type: "SET_ROUTE"; route: GraphState["route"] }
	| { type: "ADD_MESSAGE"; message: Message }
	| { type: "SET_PROJECT_CONTEXT"; project_context: any }
	| { type: "SET_RESOURCE_CONTEXT"; resource_context: any }
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
		graphState: {
			base_url: null,
			api_key: null,
			model_name: null,
			kubeconfig_encoded: null,
			messages: [],
			route: null,
			project_context: null,
			resource_context: null,
		},
		deploymentUrl: "",
		graphId: "",
	},
	states: {
		initializing: {
			on: {
				SET_GRAPH_STATE: {
					target: "ready",
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				FAIL: {
					target: "failed",
				},
			},
		},
		ready: {
			on: {
				SET_GRAPH_STATE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				SET_DEPLOYMENT_URL: {
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
					}),
				},
				SET_GRAPH_ID: {
					actions: assign({
						graphId: ({ event }) => event.graphId,
					}),
				},
				SET_DEPLOYMENT: {
					actions: assign({
						deploymentUrl: ({ event }) => event.deploymentUrl,
						graphId: ({ event }) => event.graphId,
					}),
				},
				UPDATE_GRAPH_STATE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				SET_ROUTE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							route: event.route,
						}),
					}),
				},
				ADD_MESSAGE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							messages: [...context.graphState.messages, event.message],
						}),
					}),
				},
				SET_PROJECT_CONTEXT: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							project_context: event.project_context,
						}),
					}),
				},
				SET_RESOURCE_CONTEXT: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							resource_context: event.resource_context,
						}),
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
