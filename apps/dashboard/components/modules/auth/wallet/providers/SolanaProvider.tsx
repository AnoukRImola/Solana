'use client'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
	ConnectionProvider,
	WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'

import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaProviderProps {
	children: React.ReactNode
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
	const network =
		(process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) ||
		WalletAdapterNetwork.Devnet

	const endpoint = useMemo(
		() => process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl(network),
		[network],
	)

	const wallets = useMemo(
		() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
		[],
	)

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}
