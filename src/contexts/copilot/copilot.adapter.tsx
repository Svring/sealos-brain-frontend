"use client";

import type { Interrupt, Message, Thread } from "@langchain/langgraph-sdk";
import { useMount } from "@reactuses/core";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { createContext, use } from "react";
import {
	useLangGraphEvents,
	useLangGraphState,
} from "@/contexts/langgraph/langgraph.context";
import { useCreateThread } from "@/hooks/langgraph/use-create-thread";
import { useSearchThreads } from "@/hooks/langgraph/use-search-threads";
import { useStreamContext } from "@/hooks/langgraph/use-stream-context";
import { useEffectOnCondition } from "@/hooks/use-effect-on-condition";

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
	const { deploymentUrl, graphId } = useLangGraphState();
	const { setRoute } = useLangGraphEvents();

	// Set route based on metadata content on mount
	useMount(() => {
		const route = metadata.resourceId
			? "resourceNode"
			: metadata.projectId
				? "projectNode"
				: metadata.kubeconfigEncoded
					? "proposeNode"
					: null;
		if (route) setRoute(route);
	});

	// Search threads based on metadata
	const { data: threads, isSuccess } = useSearchThreads(metadata);
	const { mutate: createThread } = useCreateThread();

	// Auto-select first thread or create new thread when search is successful
	useEffectOnCondition(() => {
		if (threads && threads.length > 0 && threads[0]?.thread_id) {
			setThreadId(threads[0].thread_id);
		} else {
			createThread(
				{ metadata },
				{
					onSuccess: (data) => {
						setThreadId(data.thread_id);
					},
				},
			);
		}
	}, isSuccess && !threadId);

	// Use stream context hook
	const {
		submitWithContext,
		isLoading,
		stop,
		messages,
		interrupt,
		joinStream,
	} = useStreamContext({
		apiUrl: deploymentUrl,
		assistantId: graphId,
		threadId: threadId || "",
	});

	return (
		<copilotAdapterContext.Provider
			value={{
				// @ts-expect-error Suppress iterable type error for threads
				threads: threads,
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
