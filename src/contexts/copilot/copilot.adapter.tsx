"use client";

import type { Thread } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { createContext, use, useState } from "react";
import { useAuthState } from "@/contexts/auth/auth.context";
import { useLangGraphState } from "@/contexts/langgraph/langgraph.context";
import { useProjectState } from "@/contexts/project/project.context";

interface CopilotAdapterContextValue {
	threads: Thread[];
	activeThreadId: string;
	metadata?: Record<string, string>;
	setThreads: (threads: Thread[]) => void;
	setActiveThreadId: (activeThreadId: string) => void;
}

export const copilotAdapterContext = createContext<
	CopilotAdapterContextValue | undefined
>(undefined);

interface CopilotAdapterProps {
	children: ReactNode;
	metadata?: Record<string, string>;
}

export function CopilotAdapter({ children, metadata }: CopilotAdapterProps) {
	const [threads, setThreads] = useState<Thread[]>([]);
	const [threadId, setThreadId] = useQueryState("threadId");
	const {
		auth: { kubeconfigEncoded },
	} = useAuthState();
	const { graphState } = useLangGraphState();
	const { project } = useProjectState();

	return (
		<copilotAdapterContext.Provider
			value={{
				threads,
				activeThreadId: threadId || "",
				metadata,
				setThreads,
				setActiveThreadId: setThreadId,
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
