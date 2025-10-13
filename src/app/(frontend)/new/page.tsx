"use client";

import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { MessagesView } from "@/mvvm/copilot/views/messages.view";
import { InputBox } from "@/mvvm/copilot/vms/input-box.vm";
import { OverlayControl } from "@/mvvm/pages/new/views/overlay-control.view";

export default function NewPage() {
	// Get copilot adapter context
	const { submitWithContext, isLoading, stop, messages, hasMessages } =
		useCopilotAdapterContext();

	const handleSubmit = (message: string) => {
		submitWithContext({
			messages: [{ type: "human", content: message }],
		});
	};

	const handleStop = () => {
		stop();
	};

	const handleOpenTemplate = () => {
		console.log("Open template dialog");
	};

	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<OverlayControl>
				<div className="flex-1 flex flex-col min-h-0 h-full">
					{/* Hero overlays the content area and fades out when messages exist */}
					{!hasMessages && (
						<motion.div
							initial={{ opacity: 0, y: 0 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className="flex-shrink-0"
						>
							<Hero
								heroTitle="Sealos Brain"
								subtitle="Let development get back to basics - focus on writing code, and let the cloud handle the rest."
								titleClassName="text-4xl md:text-5xl font-extrabold"
								subtitleClassName="text-md md:text-lg max-w-[600px]"
								actionsClassName="mt-2"
							/>
						</motion.div>
					)}

					{/* Messages area - only visible when there are messages */}
					{hasMessages && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="flex-1 flex flex-col min-h-0"
						>
							<div className="flex-1 overflow-y-auto py-8">
								<div className="max-w-3xl mx-auto w-full">
									<MessagesView messages={messages} isLoading={isLoading} />
								</div>
							</div>
						</motion.div>
					)}

					{/* Chat Input - flows naturally in the column */}
					<motion.div
						layout
						initial={!hasMessages ? { y: 0, opacity: 0 } : false}
						animate={{ y: 0, opacity: 1 }}
						transition={{
							delay: hasMessages ? 0 : 0.2,
							duration: hasMessages ? 0.4 : 0.4,
							ease: [0.45, 0, 0.55, 1],
						}}
						className={`flex-shrink-0 ${hasMessages ? "pb-8" : "py-0"}`}
					>
						<div className="container mx-auto relative max-w-3xl">
							<InputBox
								className={`max-w-3xl${!hasMessages ? " min-h-[140px]" : ""}`}
								exhibition={!hasMessages}
								onSend={handleSubmit}
								onStop={handleStop}
								isLoading={isLoading}
							/>
							{!hasMessages && (
								<div className="absolute bottom-2 left-2 right-2 flex gap-2 pointer-events-none">
									<Button
										onClick={handleOpenTemplate}
										variant="outline"
										size="sm"
										className="bg-background-tertiary! pointer-events-auto"
									>
										<LayoutTemplate />
										From Template
									</Button>
								</div>
							)}
						</div>
					</motion.div>
				</div>
			</OverlayControl>
		</div>
	);
}
