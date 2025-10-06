"use client";

import { LayoutGrid, LogOut, MessageCirclePlus } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthEvents } from "@/contexts/auth/auth.adapter";
import { logoutUser } from "@/payload/operations/users-operation";

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
	const { fail } = useAuthEvents();

	const handleLogout = async () => {
		try {
			const result = await logoutUser();
			if (result.success) {
				// Clear auth state
				fail();
				// Redirect to login or home page
				window.location.href = "/";
			} else {
				console.error("Logout failed:", result.error);
			}
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

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
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={handleLogout} tooltip="Logout">
							<LogOut />
							<span>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
