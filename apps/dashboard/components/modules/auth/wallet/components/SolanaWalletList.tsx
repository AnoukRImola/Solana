'use client'

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import '@solana/wallet-adapter-react-ui/styles.css'
import { useEffect } from 'react'
import { useGlobalAuthenticationStore } from '~/core/store/data'

interface SolanaWalletListProps {
	onClose: () => void
}

export const SolanaWalletList: React.FC<SolanaWalletListProps> = ({
	onClose,
}) => {
	const { connected, publicKey, select, wallets } = useSolanaWallet()
	const { connectWalletStore, address, walletType } =
		useGlobalAuthenticationStore()

	const handleConnect = async () => {
		if (wallets.length > 0) {
			select(wallets[0].adapter.name) // e.g., Phantom, Backpack, etc.
		}
	}

	useEffect(() => {
		if (connected && publicKey) {
			const walletAddress = publicKey.toString()
			if (walletAddress !== address || walletType !== 'solana') {
				connectWalletStore(walletAddress, 'Solana Wallet', 'solana')
			}
			onClose()
		}
	}, [connected, publicKey, connectWalletStore, onClose, address, walletType])

	return (
		<div className="flex flex-col gap-4 p-6">
			<button
				type="button"
				onClick={handleConnect}
				className="flex w-full items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
			>
				<img src="/solana-logo.svg" alt="Solana" className="h-10 w-10" />
				<div className="flex flex-col items-start">
					<span className="text-lg font-semibold">Connect Solana Wallet</span>
					<span className="text-sm text-muted-foreground">
						Connect using your Solana wallet
					</span>
				</div>
			</button>
		</div>
	)
}
