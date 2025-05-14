import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit'
import { useGlobalAuthenticationStore } from '~/core/store/data'
import { kit } from '../constants/wallet-kit.constant'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'

export const useWallet = () => {
	const { connectWalletStore, disconnectWalletStore, walletType, address } =
		useGlobalAuthenticationStore()
	const { disconnect: disconnectSolana, connected: solanaConnected, publicKey } = useSolanaWallet()

	// Handle Solana wallet reconnection
	useEffect(() => {
		if (walletType === 'solana' && solanaConnected && publicKey) {
			const walletAddress = publicKey.toString()
			if (walletAddress !== address) {
				connectWalletStore(walletAddress, 'Solana Wallet', 'solana')
			}
		}
	}, [solanaConnected, publicKey, walletType, address, connectWalletStore])

	const connectWallet = async () => {
		await kit.openModal({
			modalTitle: 'Connect to your favorite wallet',
			onWalletSelected: async (option: ISupportedWallet) => {
				kit.setWallet(option.id)

				const { address } = await kit.getAddress()
				const { name } = option

				connectWalletStore(address, name, 'stellar')
			},
		})
	}

	const disconnectWallet = async () => {
		if (walletType === 'solana') {
			await disconnectSolana()
		} else {
			await kit.disconnect()
		}
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
