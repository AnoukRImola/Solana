'use client'

import { useWallet } from '../hooks/wallet.hook'

interface StellarWalletListProps {
  onClose: () => void
}

export const StellarWalletList: React.FC<StellarWalletListProps> = ({ onClose }) => {
  const { connectWallet } = useWallet()

  const handleConnect = async () => {
    await connectWallet()
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        type="button"
        onClick={handleConnect}
        className="flex items-center gap-2 rounded-lg border p-4 hover:bg-accent"
      >
        <img src="/stellar-logo.svg" alt="Stellar" className="h-8 w-8" />
        <div className="flex flex-col items-start">
          <span className="font-medium">Connect Stellar Wallet</span>
          <span className="text-sm text-muted-foreground">
            Connect using your Stellar wallet
          </span>
        </div>
      </button>
    </div>
  )
} 