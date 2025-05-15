'use client'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { SolanaWalletList } from './SolanaWalletList'
import { StellarWalletList } from './StellarWalletList'

interface WalletSelectionModalProps {
	isOpen: boolean
	onClose: () => void
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
	isOpen,
	onClose,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6 pb-2">
					<DialogTitle className="text-2xl font-semibold">
						Connect Wallet
					</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="stellar" className="w-full">
					<TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0">
						<TabsTrigger
							value="stellar"
							className="rounded-full border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						>
							Stellar
						</TabsTrigger>
						<TabsTrigger
							value="solana"
							className="rounded-full border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
						>
							Solana
						</TabsTrigger>
					</TabsList>
					<TabsContent value="stellar" className="m-0">
						<StellarWalletList onClose={onClose} />
					</TabsContent>
					<TabsContent value="solana" className="m-0">
						<SolanaWalletList onClose={onClose} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
