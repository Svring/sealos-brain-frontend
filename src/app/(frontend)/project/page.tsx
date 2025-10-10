import { OverlayControl } from "@/mvvm/pages/project/views/overlay-control.view";
import { ProjectDashboard } from "@/mvvm/pages/project/vms/project-dashboard.vm";

export default function ProjectPage() {
	return (
		<div className="h-full w-full flex flex-col overflow-hidden">
			<OverlayControl>
				<ProjectDashboard />
			</OverlayControl>
		</div>
	);
}
