'use client'

import { redirect } from 'next/navigation'
import { Lights } from '~/components/layout/all/ui/utils/Lights'
import Footer from '~/components/layout/footer/Footer'
import Header from '~/components/layout/header/Header'
import AppSidebar from '~/components/layout/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { useGlobalAuthenticationStore } from '~/core/store/data'
import useLayoutDashboard from '~/hooks/layout-dashboard.hook'

const Layout = ({ children }: { children: React.ReactNode }) => {
	const { address } = useGlobalAuthenticationStore()
	const { label } = useLayoutDashboard()

	// Authentication check
	if (address === '') {
		redirect('/')
	}

	return (
		<SidebarProvider>
			<Lights />
			<AppSidebar />
			<SidebarInset>
				<Header />
				<div className="min-h-screen">
					<div className="flex-1 space-y-4 p-4 pt-6 md:p-8 h-full">
						{label !== 'Help' && label !== 'Report Issue' && (
							<h2 className="text-3xl font-bold tracking-tight">{label}</h2>
						)}
						{children}
					</div>
				</div>
				<Footer />
			</SidebarInset>
		</SidebarProvider>
	)
}

export default Layout
