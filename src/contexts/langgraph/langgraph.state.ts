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
	region_url?: string | null;
	kubeconfig?: string | null;
	messages: Message[];
	stage?:
		| "manage_project"
		| "manage_resource"
		| "deploy_project"
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
			type: "SET_CONFIG";
			base_url: string;
			api_key: string;
			model_name: string;
			region_url: string;
			kubeconfig: string;
	  }
	| { type: "SET_DEPLOYMENT_URL"; deploymentUrl: string }
	| { type: "SET_GRAPH_ID"; graphId: string }
	| { type: "UPDATE_GRAPH_STATE"; graphState: Partial<GraphState> }
	| { type: "SET_STAGE"; stage: GraphState["stage"] }
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
			region_url: null,
			kubeconfig: null,
			messages: [],
			stage: null,
			project_context: null,
			resource_context: null,
		},
		deploymentUrl: "",
		graphId: "",
	},
	states: {
		initializing: {
			on: {
				SET_CONFIG: {
					target: "ready",
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							base_url: event.base_url,
							api_key: event.api_key,
							model_name: event.model_name,
							region_url: event.region_url,
							kubeconfig: event.kubeconfig,
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
				UPDATE_GRAPH_STATE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							...event.graphState,
						}),
					}),
				},
				SET_STAGE: {
					actions: assign({
						graphState: ({ context, event }) => ({
							...context.graphState,
							stage: event.stage,
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
