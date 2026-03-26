/* eslint-disable ~typescript-eslint/no-explicit-any */

'use client'

import { useWallet } from '~/components/modules/auth/wallet/hooks/wallet.hook'
import {
	useGlobalAuthenticationStore,
	useGlobalBoundedStore,
} from '~/core/store/data'
import { toast } from '~/hooks/toast.hook'
import { startDispute } from '../../../services/start-dispute.service'
import { useEscrowUIBoundedStore } from '../../../store/ui'

const useStartDisputeEscrowDialog = () => {
	const { signTransaction } = useWallet()
	const { address } = useGlobalAuthenticationStore()
	const setIsStartingDispute = useEscrowUIBoundedStore(
		(state) => state.setIsStartingDispute,
	)
	const setIsDialogOpen = useEscrowUIBoundedStore(
		(state) => state.setIsDialogOpen,
	)
	const setSelectedEscrow = useGlobalBoundedStore(
		(state) => state.setSelectedEscrow,
	)
	const fetchAllEscrows = useGlobalBoundedStore(
		(state) => state.fetchAllEscrows,
	)
	const updateEscrow = useGlobalBoundedStore((state) => state.updateEscrow)
	const activeTab = useEscrowUIBoundedStore((state) => state.activeTab)
	const selectedEscrow = useGlobalBoundedStore((state) => state.selectedEscrow)

	const startDisputeSubmit = async () => {
		setIsStartingDispute(true)

		if (!selectedEscrow) return

		try {
			if (!signTransaction) throw new Error('Wallet not connected')

			const response = await startDispute({
				contractId: selectedEscrow?.contractId,
				signer: address,
			}, signTransaction)

			setIsStartingDispute(false)

			if (response.status === 'SUCCESS') {
				setIsDialogOpen(false)
				setSelectedEscrow(undefined)
				updateEscrow({
					escrowId: selectedEscrow.id,
					payload: {
						...selectedEscrow,
						disputeStartedBy: activeTab,
					},
				})
				fetchAllEscrows({ address, type: activeTab || 'client' })

				toast({
					title: 'Success',
					description: `You have started a dispute in ${selectedEscrow.title}.`,
				})
			}
		} catch (error: any) {
			setIsStartingDispute(false)

			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	return { startDisputeSubmit }
}

export default useStartDisputeEscrowDialog
