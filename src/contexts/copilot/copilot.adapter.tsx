"use client";

import type { Interrupt, Message, Thread } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { createContext, use } from "react";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";
import { useCreateThread } from "@/hooks/langgraph/use-create-thread";
import { useSearchThreads } from "@/hooks/langgraph/use-search-threads";
import { useEffectOnCondition } from "@/hooks/use-effect-on-condition";
import { useAuthState } from "../auth/auth.context";

interface CopilotAdapterContextValue {
	threads: Thread[];
	threadId: string;
	metadata?: Record<string, string>;
	setThreadId: (threadId: string) => void;
	submitWithContext: (data: { messages: Message[] }) => void;
	isLoading: boolean;
	stop: () => void;
	messages: Message[];
	interrupt: Interrupt<unknown> | undefined;
	joinStream: (runId: string) => Promise<void>;
}

export const copilotAdapterContext = createContext<
	CopilotAdapterContextValue | undefined
>(undefined);

interface CopilotAdapterProps {
	children: ReactNode;
	metadata: Record<string, string>;
}

export function CopilotAdapter({ children, metadata }: CopilotAdapterProps) {
	const [threadId, setThreadId] = useQueryState("threadId");
	const { deploymentUrl, graphId, graphState } = useLangGraphState();
	const { auth } = useAuthState();

	// Search threads based on metadata
	const { data: threads, isSuccess } = useSearchThreads(metadata);
	const { mutate: createThread } = useCreateThread(metadata);

	// Auto-select first thread or create new thread when search is successful
	useEffectOnCondition(() => {
		console.log("[CopilotAdapter] useEffectOnCondition triggered", {
			threads,
			isSuccess,
			threadId,
			metadata
		});
		if (threads && threads.length > 0 && threads[0]?.thread_id) {
			console.log("[CopilotAdapter] Selecting existing thread", {
				selectedThreadId: threads[0].thread_id
			});
			setThreadId(threads[0].thread_id);
		} else {
			console.log("[CopilotAdapter] No threads found. Creating new thread.", {
				metadata
			});
			createThread(metadata, {
				onSuccess: (data) => {
					console.log("[CopilotAdapter] New thread created", { newThreadId: data.thread_id });
					setThreadId(data.thread_id);
				},
			});
		}
	}, isSuccess && !threadId);

	const { submit, isLoading, stop, messages, interrupt, joinStream } =
		useStream({
			apiUrl: deploymentUrl,
			assistantId: graphId,
			threadId: threadId,
			messagesKey: "messages",
			reconnectOnMount: true,
		});

	const submitWithContext = (data: { messages: Message[] }) => {
		return submit(
			{
				api_key: graphState.api_key,
				base_url: graphState.base_url,
				model_name: graphState.model_name,
				region_url: auth?.regionUrl,
				kubeconfigEncoded: auth?.kubeconfigEncoded,
				messages: data.messages,
			},
			{
				optimisticValues(prev) {
					const prevMessages = prev.messages ?? [];
					// @ts-expect-error Suppress iterable type error for newMessages
					const newMessages = [...prevMessages, ...data.messages];
					return { ...prev, messages: newMessages };
				},
			},
		);
	};

	return (
		<copilotAdapterContext.Provider
			value={{
				threads: (threads || []).map((thread) => ({
					...thread,
					metadata: thread.metadata || {},
				})),
				threadId: threadId || "",
				metadata,
				setThreadId,
				submitWithContext,
				isLoading,
				stop,
				messages,
				interrupt,
				joinStream,
			}}
		>
			{children}
		</copilotAdapterContext.Provider>
	);
}

export function useCopilotAdapterContext() {
	const ctx = use(copilotAdapterContext);
	if (!ctx) {
		throw new Error(
			"useCopilotAdapterContext must be used within CopilotAdapter",
		);
	}
	return ctx;
}
