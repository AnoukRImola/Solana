'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { StellarWalletList } from './StellarWalletList'
import { SolanaWalletList } from './SolanaWalletList'

interface WalletSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="stellar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stellar">Stellar</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>
          <TabsContent value="stellar">
            <StellarWalletList onClose={onClose} />
          </TabsContent>
          <TabsContent value="solana">
            <SolanaWalletList onClose={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 