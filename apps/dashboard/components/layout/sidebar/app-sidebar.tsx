'use client'

import type * as React from 'react'
import { ItemsSidebar } from '~/components/layout/sidebar/constants/sidebar-items.constant'
import { NavUser } from '~/components/layout/sidebar/nav-user'
import TeamSwitcher from '~/components/layout/sidebar/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '~/components/ui/sidebar'
import NavMain from './nav-main'

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={ItemsSidebar.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain groups={ItemsSidebar.navGroups} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}

export default AppSidebar
