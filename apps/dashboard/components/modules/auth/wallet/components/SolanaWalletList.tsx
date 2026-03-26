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
		<div className="flex flex-col gap-2 p-6">
			{wallets.map((wallet) => (
				<button
					key={wallet.adapter.name}
					type="button"
					onClick={() => select(wallet.adapter.name)}
					className="flex w-full items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
				>
					<img
						src={wallet.adapter.icon}
						alt={wallet.adapter.name}
						className="h-8 w-8"
					/>
					<span className="text-lg font-semibold">{wallet.adapter.name}</span>
				</button>
			))}
		</div>
	)
}
