"use client";

import { useState } from "react";
import { useDevboxLifecycle } from "@/hooks/devbox/use-devbox-lifecycle";
import { DevboxMenuView } from "@/mvvm/flow/nodes/views/devbox/devbox-menu.view";
import type { DevboxObject } from "@/mvvm/sealos/devbox/models/devbox-object.model";

interface DevboxMenuProps {
	object: DevboxObject;
	onDelete?: (devboxName: string) => void;
}

export function DevboxMenu({ object, onDelete }: DevboxMenuProps) {
	const { name: devboxName, status } = object;
	const { mutate: executeAction, isPending } = useDevboxLifecycle();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("");

	const handleDeleteClick = () => {
		setDeleteConfirmationValue("");
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = () => {
		if (deleteConfirmationValue.trim() === devboxName) {
			executeAction("delete", devboxName);
			onDelete?.(devboxName);
			setShowDeleteDialog(false);
			setDeleteConfirmationValue("");
		}
	};

	const isDeleteConfirmationValid =
		deleteConfirmationValue.trim() === devboxName;

	return (
		<DevboxMenuView
			devboxName={devboxName}
			status={status}
			showDeleteDialog={showDeleteDialog}
			setShowDeleteDialog={setShowDeleteDialog}
			deleteConfirmationValue={deleteConfirmationValue}
			setDeleteConfirmationValue={setDeleteConfirmationValue}
			handleDeleteClick={handleDeleteClick}
			handleDeleteConfirm={handleDeleteConfirm}
			executeAction={executeAction}
			isPending={isPending}
			isDeleteConfirmationValid={isDeleteConfirmationValid}
		/>
	);
}
