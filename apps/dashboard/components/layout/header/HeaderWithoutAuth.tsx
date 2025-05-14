'use client'

import { Bug, Copy, LogIn, LogOut, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useWallet } from '~/components/modules/auth/wallet/hooks/wallet.hook'
import { Button } from '~/components/ui/button'
import { WalletSelectionModal } from '~/components/modules/auth/wallet/components/WalletSelectionModal'
import ThemeToggle from './ThemeToggle'
import useHeaderWithoutAuth from './hooks/header-without-auth.hook'
import { useGlobalAuthenticationStore } from '~/core/store/data'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useCopyUtils } from '~/utils/hook/copy.hook'

const HeaderWithoutAuth: React.FC = () => {
	const { handleDisconnect } = useWallet()
	const { address, handleReportIssue } = useHeaderWithoutAuth()
	const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
	const walletType = useGlobalAuthenticationStore((state) => state.walletType)
	const { copyToClipboard } = useCopyUtils()

	const handleCopyAddress = () => {
		if (address) {
			copyToClipboard(address)
		}
	}

	return (
		<div className="flex w-full justify-between items-center gap-2 px-4">
			<Link href="/">
				<Image src="/logo.png" alt="Trustless Work" width={80} height={80} />
			</Link>
			{address ? (
				<div className="flex gap-5 ml-auto">
					<ThemeToggle />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<User className="h-4 w-4" />
								{address.slice(0, 4)}...{address.slice(-4)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleCopyAddress}>
								<Copy className="mr-2 h-4 w-4" />
								Copy Address
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleDisconnect}>
								<LogOut className="mr-2 h-4 w-4" />
								Disconnect {walletType === 'solana' ? 'Solana' : 'Stellar'} Wallet
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex gap-5 ml-auto">
					<ThemeToggle />

					<Button variant="destructive" onClick={handleReportIssue}>
						<Bug /> Report Issue
					</Button>

					<Button variant="outline" onClick={() => setIsWalletModalOpen(true)}>
						<LogIn /> Connect
					</Button>

					<WalletSelectionModal
						isOpen={isWalletModalOpen}
						onClose={() => setIsWalletModalOpen(false)}
					/>
				</div>
			)}
		</div>
	)
}

export default HeaderWithoutAuth
