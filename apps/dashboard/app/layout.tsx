import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './global.css'
import { Analytics } from '@vercel/analytics/react'
import { SolanaProvider } from '~/components/modules/auth/wallet/providers/SolanaProvider'
import { Toaster } from '~/components/ui/sonner'
import MoonpayClientProvider from '~/providers/MoonpayClientProvider'

export const metadata: Metadata = {
	title: 'Trustless Work',
	description: 'Trustless Work',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${GeistSans.className} bg-background text-foreground`}>
				<Analytics />
				<MoonpayClientProvider>
					<SolanaProvider>
						<main className="relative flex min-h-screen w-full">
							<div className="flex-1 flex flex-col w-full">
								<div className="flex-1 w-full p-4">{children}</div>
							</div>
						</main>
					</SolanaProvider>
				</MoonpayClientProvider>
				<Toaster />
			</body>
		</html>
	)
}
