"use client";

import { AlertCircleIcon, Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DevboxMenuViewProps {
	devboxName: string;
	status: string;
	showDeleteDialog: boolean;
	setShowDeleteDialog: (show: boolean) => void;
	deleteConfirmationValue: string;
	setDeleteConfirmationValue: (value: string) => void;
	handleDeleteClick: () => void;
	handleDeleteConfirm: () => void;
	executeAction: (action: string, name: string) => void;
	isPending: (action: string) => boolean;
	isDeleteConfirmationValid: boolean;
}

export function DevboxMenuTrigger({ children }: { children: React.ReactNode }) {
	return <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>;
}

export function DevboxMenuView({
	devboxName,
	status,
	showDeleteDialog,
	setShowDeleteDialog,
	deleteConfirmationValue,
	setDeleteConfirmationValue,
	handleDeleteClick,
	handleDeleteConfirm,
	executeAction,
	isPending,
	isDeleteConfirmationValid,
}: DevboxMenuViewProps) {
	return (
		<>
			<DropdownMenuContent
				className="rounded-xl bg-background-secondary"
				align="start"
			>
				{status !== "Running" && (
					<DropdownMenuItem
						onClick={() => executeAction("start", devboxName)}
						disabled={status === "Pending" || isPending("start")}
						className={status === "Pending" ? "opacity-50" : ""}
					>
						<Play className="mr-2 h-4 w-4" />
						Start
					</DropdownMenuItem>
				)}
				{status !== "Stopped" && status !== "Shutdown" && (
					<DropdownMenuItem
						onClick={() => executeAction("pause", devboxName)}
						disabled={status === "Pending" || isPending("pause")}
						className={status === "Pending" ? "opacity-50" : ""}
					>
						<Pause className="mr-2 h-4 w-4" />
						Pause
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => executeAction("restart", devboxName)}
					disabled={status === "Pending" || isPending("restart")}
					className={status === "Pending" ? "opacity-50" : ""}
				>
					<RotateCcw className="mr-2 h-4 w-4" />
					Restart
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="text-destructive"
					disabled={isPending("delete")}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Devbox</AlertDialogTitle>
					</AlertDialogHeader>

					<Alert
						variant="destructive"
						className="bg-status-deleting text-red-700 border-none"
					>
						<AlertCircleIcon />
						<AlertDescription className="text-red-700!">
							This action cannot be undone and will permanently remove the
							devbox and all its data.
						</AlertDescription>
					</Alert>

					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							Type the devbox name{" "}
							<span className="font-semibold text-foreground">
								"{devboxName}"
							</span>{" "}
							to confirm:
						</p>
						<Input
							value={deleteConfirmationValue}
							onChange={(e) => setDeleteConfirmationValue(e.target.value)}
							placeholder={devboxName}
							className="w-full"
							autoFocus
						/>
						{deleteConfirmationValue && !isDeleteConfirmationValid && (
							<p className="text-sm text-destructive">
								Devbox name does not match. Please type "{devboxName}" to
								confirm.
							</p>
						)}
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							disabled={isPending("delete") || !isDeleteConfirmationValid}
							className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending("delete") ? "Deleting..." : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
