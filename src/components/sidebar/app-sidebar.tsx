import { LayoutGrid, MessageCirclePlus } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";

// Menu items.
const mainItems = [
	{
		title: "New",
		url: "#",
		icon: MessageCirclePlus,
	},
	{
		title: "Projects",
		url: "#",
		icon: LayoutGrid,
	},
];

export function AppSidebar() {
	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
						<img
							src="/sealos-brain-icon-grayscale.svg"
							className="grayscale"
							alt="Sealos Brain"
							width={28}
							height={28}
						/>
					</div>
					<span className="truncate font-medium text-sidebar-foreground group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-200">
						Sealos Brain
					</span>
				</div>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				{/* Main Actions */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
