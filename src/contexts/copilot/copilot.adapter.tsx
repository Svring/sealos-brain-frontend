"use client";

import type { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { createContext, use, useState } from "react";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";
import { useSearchThreads } from "@/hooks/langgraph/use-search-threads";

interface CopilotAdapterContextValue {
	threads: Thread[];
	threadId: string;
	metadata?: Record<string, string>;
	setThreads: (threads: Thread[]) => void;
	setThreadId: (threadId: string) => void;
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
	const { graphState } = useLangGraphState();

	// Search threads based on metadata
	const { data: threads, isLoading } = useSearchThreads(metadata);

	return (
		<copilotAdapterContext.Provider
			value={{
				threads: threads || [],
				threadId: threadId || "",
				metadata,
				setThreadId,
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
