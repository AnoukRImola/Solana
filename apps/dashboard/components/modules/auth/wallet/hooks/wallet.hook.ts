import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEffect } from 'react'
import { useGlobalAuthenticationStore } from '~/core/store/data'

export const useWallet = () => {
	const { connectWalletStore, disconnectWalletStore, walletType, address } =
		useGlobalAuthenticationStore()
	const {
		disconnect: disconnectSolana,
		connected: solanaConnected,
		publicKey,
		signTransaction,
	} = useSolanaWallet()
	const { setVisible } = useWalletModal()

	useEffect(() => {
		if (solanaConnected && publicKey) {
			const walletAddress = publicKey.toString()
			if (walletAddress !== address) {
				connectWalletStore(walletAddress, 'Solana Wallet', 'solana')
			}
		}
	}, [solanaConnected, publicKey, walletType, address, connectWalletStore])

	const handleConnect = async () => {
		setVisible(true)
	}

	const handleDisconnect = async () => {
		try {
			await disconnectSolana()
			disconnectWalletStore()
		} catch (error) {
			console.error('Error disconnecting wallet:', error)
		}
	}

	return {
		handleConnect,
		handleDisconnect,
		signTransaction,
		connected: solanaConnected,
		publicKey,
	}
}
