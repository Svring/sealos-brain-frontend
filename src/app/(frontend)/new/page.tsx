"use client";

import { motion } from "framer-motion";
import { LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { InputBoxVM } from "@/mvvm/copilot/vms/input-box.vm";
import { OverlayControl } from "@/mvvm/pages/new/views/overlay-control.view";

export default function NewPage() {
	const [showMessages, setShowMessages] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = (message: string) => {
		console.log("Message submitted:", message);
		setShowMessages(true);
		setIsLoading(true);

		// Simulate loading
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	};

	const handleStop = () => {
		console.log("Stop generation");
		setIsLoading(false);
	};

	const handleNewChat = () => {
		console.log("Create new chat");
		setShowMessages(false);
	};

	const handleOpenTemplate = () => {
		console.log("Open template dialog");
	};

	return (
		<OverlayControl className="h-full w-full flex flex-col overflow-hidden">
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
								<div className="text-center text-muted-foreground">
									Messages will appear here...
								</div>
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
						<InputBoxVM
							className={`max-w-3xl${!showMessages ? " min-h-[140px]" : ""}`}
							exhibition={!showMessages}
							onSend={handleSubmit}
							onStop={handleStop}
							isLoading={isLoading}
						/>
						{!showMessages && (
							<div className="absolute bottom-2 left-2 right-2 flex gap-2 pointer-events-none">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={handleOpenTemplate}
												variant="outline"
												className="bg-background-tertiary! border-border-primary! pointer-events-auto"
											>
												<LayoutTemplate />
												From Template
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Deploy from app store templates</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</OverlayControl>
	);
}
