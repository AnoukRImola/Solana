import { useCallback } from 'react'
import type { ApiResponse } from '../../types/common.types'
import type {
	BalanceItem,
	GetMultipleEscrowBalanceParams,
	SendTransactionParams,
	SetTrustlineParams,
} from '../../types/helper.types'
import { useTrustlessWork } from '../context'

export function useSendTransaction() {
	const tw = useTrustlessWork()
	const sendTransaction = useCallback(
		(params: SendTransactionParams): Promise<ApiResponse> =>
			tw.helper.sendTransaction(params),
		[tw],
	)
	return { sendTransaction }
}

export function useSetTrustline() {
	const tw = useTrustlessWork()
	const setTrustline = useCallback(
		(params: SetTrustlineParams): Promise<ApiResponse> =>
			tw.helper.setTrustline(params),
		[tw],
	)
	return { setTrustline }
}

export function useGetMultipleEscrowBalance() {
	const tw = useTrustlessWork()
	const getMultipleEscrowBalance = useCallback(
		(params: GetMultipleEscrowBalanceParams): Promise<BalanceItem[]> =>
			tw.helper.getMultipleEscrowBalance(params),
		[tw],
	)
	return { getMultipleEscrowBalance }
}
