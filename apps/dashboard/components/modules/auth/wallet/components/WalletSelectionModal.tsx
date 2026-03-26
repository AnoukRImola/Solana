'use client'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { SolanaWalletList } from './SolanaWalletList'

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
				<SolanaWalletList onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
