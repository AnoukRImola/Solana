'use client'

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { useEffect } from 'react'
import { useGlobalAuthenticationStore } from '~/core/store/data'

interface SolanaWalletListProps {
  onClose: () => void
}

export const SolanaWalletList: React.FC<SolanaWalletListProps> = ({ onClose }) => {
  const { connected, publicKey } = useSolanaWallet()
  const { connectWalletStore, address, walletType } = useGlobalAuthenticationStore()

  useEffect(() => {
    // Handle initial connection and reconnection
    if (connected && publicKey) {
      const walletAddress = publicKey.toString()
      // Only update store if the address has changed or wallet type is different
      if (walletAddress !== address || walletType !== 'solana') {
        connectWalletStore(walletAddress, 'Solana Wallet', 'solana')
      }
      onClose()
    }
  }, [connected, publicKey, connectWalletStore, onClose, address, walletType])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 rounded-lg border p-4">
        <img src="/solana-logo.svg" alt="Solana" className="h-8 w-8" />
        <div className="flex flex-col items-start">
          <span className="font-medium">Connect Solana Wallet</span>
          <span className="text-sm text-muted-foreground">
            Connect using your Solana wallet
          </span>
        </div>
      </div>
      <div className="wallet-adapter-button-trigger">
        <WalletMultiButton className="!w-full !h-12 !bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-lg" />
      </div>
    </div>
  )
} 