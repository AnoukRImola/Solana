import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import { useGlobalAuthenticationStore } from '~/core/store/data'

export const useWallet = () => {
	const { connectWalletStore, disconnectWalletStore, walletType, address } =
		useGlobalAuthenticationStore()
	const {
		disconnect: disconnectSolana,
		connected: solanaConnected,
		publicKey,
	} = useSolanaWallet()

	// Handle Solana wallet reconnection
	useEffect(() => {
		if (solanaConnected && publicKey) {
			const walletAddress = publicKey.toString()
			if (walletAddress !== address) {
				connectWalletStore(walletAddress, 'Solana Wallet', 'solana')
			}
		}
	}, [solanaConnected, publicKey, walletType, address, connectWalletStore])

	const connectWallet = async () => {
		// TODO: PR7 — Solana wallet connection is handled by WalletMultiButton
		console.warn('Use Solana wallet adapter WalletMultiButton to connect.')
	}

	const disconnectWallet = async () => {
		await disconnectSolana()
		disconnectWalletStore()
	}

	const handleConnect = async () => {
		try {
			await connectWallet()
		} catch (error) {
			console.error('Error connecting wallet:', error)
		}
	}

	const handleDisconnect = async () => {
		try {
			if (disconnectWallet) {
				await disconnectWallet()
			}
		} catch (error) {
			console.error('Error disconnecting wallet:', error)
		}
	}

	return {
		connectWallet,
		disconnectWallet,
		handleConnect,
		handleDisconnect,
	}
}
