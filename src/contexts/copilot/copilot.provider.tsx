import type React from "react";

interface CopilotProviderProps {
	children: React.ReactNode;
}

export async function CopilotProvider({ children }: CopilotProviderProps) {
	return <>{children}</>;
}
