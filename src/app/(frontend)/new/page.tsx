"use client";

import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import { useCopilotAdapterContext } from "@/contexts/copilot/copilot.adapter";
import { InputBox } from "@/mvvm/copilot/vms/input-box.vm";
import { OverlayControl } from "@/mvvm/pages/new/views/overlay-control.view";

export default function NewPage() {
	// Get copilot adapter context
	const {
		submitWithContext,
		isLoading,
		stop,
		messages,
		setThreadId,
	} = useCopilotAdapterContext();

	console.log("Messages:", messages);

	// Compute showMessages based on whether there are messages
	const showMessages = messages.length > 0;

	const handleSubmit = (message: string) => {
		// Submit message using copilot adapter
		submitWithContext({
			messages: [{ type: "human", content: message }],
		});
	};

	const handleStop = () => {
		console.log("Stop generation");
		stop();
	};

	const handleNewChat = () => {
		console.log("Create new chat");
		// Reset thread ID to create a new thread
		setThreadId("");
	};

	const handleOpenTemplate = () => {
		console.log("Open template dialog");
	};

	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<OverlayControl>
				<div className="flex-1 flex flex-col min-h-0">
					{/* Hero overlays the content area and fades out when messages exist */}
					{!showMessages && (
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

					{/* Create New Chat Button - Absolute Top Left */}
					{showMessages && (
						<div className="absolute top-4 left-16 z-10">
							<Button
								onClick={handleNewChat}
								variant="outline"
								size="sm"
								className="border-none bg-background! hover:bg-muted"
							>
								New Chat
							</Button>
						</div>
					)}

					{/* Messages area - only visible when there are messages */}
					{showMessages && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="flex-1 flex flex-col min-h-0"
						>
							<div className="flex-1 overflow-y-auto py-8">
								<div className="max-w-3xl mx-auto w-full">
									{messages.length > 0 ? (
										<div className="space-y-4">
											{messages.map((message, index) => (
												<div
													key={message.id}
													className={`p-4 rounded-lg ${
														message.type === "human"
															? "bg-blue-100 ml-auto max-w-[80%]"
															: "bg-gray-100 mr-auto max-w-[80%]"
													}`}
												>
													<div className="text-sm font-medium mb-1">
														{message.type === "human" ? "You" : "Assistant"}
													</div>
													<div className="text-sm">
														{typeof message.content === "string"
															? message.content
															: JSON.stringify(message.content)}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center text-muted-foreground">
											Messages will appear here...
										</div>
									)}
								</div>
							</div>
						</motion.div>
					)}

					{/* Chat Input - flows naturally in the column */}
					<motion.div
						layout
						initial={!showMessages ? { y: 0, opacity: 0 } : false}
						animate={{ y: 0, opacity: 1 }}
						transition={{
							delay: showMessages ? 0 : 0.2,
							duration: showMessages ? 0.4 : 0.6,
							ease: "easeOut",
						}}
						className={`flex-shrink-0 ${showMessages ? "pb-8" : "py-0"}`}
					>
						<div className="container mx-auto relative max-w-3xl">
							<InputBox
								className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
								exhibition={!showMessages}
								onSend={handleSubmit}
								onStop={handleStop}
								isLoading={isLoading}
							/>
							{!showMessages && (
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
