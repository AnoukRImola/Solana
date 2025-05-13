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
    <div className="flex flex-col gap-4 p-6">
      <button
        type="button"
        onClick={handleConnect}
        className="flex w-full items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
      >
        <img src="/stellar-logo.svg" alt="Stellar" className="h-10 w-10" />
        <div className="flex flex-col items-start">
          <span className="text-lg font-semibold">Connect Stellar Wallet</span>
          <span className="text-sm text-muted-foreground">
            Connect using your Stellar wallet
          </span>
        </div>
      </button>
    </div>
  )
} 