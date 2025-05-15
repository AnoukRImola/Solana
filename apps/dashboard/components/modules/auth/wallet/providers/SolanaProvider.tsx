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

interface SolanaProviderProps {
	children: React.ReactNode
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
	const network = WalletAdapterNetwork.Devnet

	// You can also provide a custom RPC endpoint
	const endpoint = useMemo(() => clusterApiUrl(network), [network])

	// @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
	const wallets = useMemo(() => [new SolflareWalletAdapter()], [])

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	)
}
