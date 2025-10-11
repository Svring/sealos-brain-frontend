"use client";

import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { copilotMachineContext } from "./copilot.context";
import { copilotMachine } from "./copilot.state";

interface CopilotAdapterProps {
	children: ReactNode;
}

export function CopilotAdapter({ children }: CopilotAdapterProps) {
	const [state, send] = useMachine(copilotMachine);

	return (
		<copilotMachineContext.Provider
			value={{ chats: state.context.chats, state, send }}
		>
			{children}
		</copilotMachineContext.Provider>
	);
}
