/* eslint-disable ~typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import type { Trustline } from '~/@types/trustline.entity'
import { useWallet } from '~/components/modules/auth/wallet/hooks/wallet.hook'
import { initializeEscrow } from '~/components/modules/escrow/services/initialize-escrow.service'
import {
	useGlobalAuthenticationStore,
	useGlobalBoundedStore,
} from '~/core/store/data'
import { useGlobalUIBoundedStore } from '~/core/store/ui'
import { toast } from '~/hooks/toast.hook'
import { GetFormSchema } from '../schema/initialize-escrow.schema'
import { useEscrowUIBoundedStore } from '../store/ui'

export const useInitializeEscrow = () => {
	const { signTransaction } = useWallet()

	const [showSelect, setShowSelect] = useState({
		approver: false,
		serviceProvider: false,
		platformAddress: false,
		releaseSigner: false,
		disputeResolver: false,
		receiver: false,
	})

	const { address } = useGlobalAuthenticationStore()
	const setIsLoading = useGlobalUIBoundedStore((state) => state.setIsLoading)
	const formData = useEscrowUIBoundedStore((state) => state.formData)
	const setFormData = useEscrowUIBoundedStore((state) => state.setFormData)
	const resetForm = useEscrowUIBoundedStore((state) => state.resetForm)
	const setCurrentStep = useEscrowUIBoundedStore(
		(state) => state.setCurrentStep,
	)
	const router = useRouter()
	const setIsSuccessDialogOpen = useEscrowUIBoundedStore(
		(state) => state.setIsSuccessDialogOpen,
	)
	const resetSteps = useGlobalUIBoundedStore((state) => state.resetSteps)
	const setRecentEscrow = useGlobalBoundedStore(
		(state) => state.setRecentEscrow,
	)
	const getAllUsers = useGlobalAuthenticationStore((state) => state.getAllUsers)
	const users = useGlobalAuthenticationStore((state) => state.users)
	const getAllTrustlines = useGlobalBoundedStore(
		(state) => state.getAllTrustlines,
	)
	const trustlines = useGlobalBoundedStore((state) => state.trustlines)
	const formSchema = GetFormSchema()

	useEffect(() => {
		getAllUsers()
		getAllTrustlines()
	}, [getAllUsers, getAllTrustlines])

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			trustline: '',
			approver: '',
			engagementId: '',
			title: '',
			description: '',
			serviceProvider: '',
			platformAddress: '',
			receiver: '',
			platformFee: '',
			amount: '',
			receiverMemo: '',
			releaseSigner: '',
			disputeResolver: '',
			milestones: [{ description: '' }],
		},
		mode: 'onChange',
	})

	// Load stored form data when component mounts
	useEffect(() => {
		if (formData) {
			Object.keys(formData).forEach((key) => {
				form.setValue(key as any, formData[key as keyof typeof formData])
			})
		}
	}, [formData, form])

	const milestones = form.watch('milestones')
	const isAnyMilestoneEmpty = milestones.some(
		(milestone) => milestone.description === '',
	)

	const handleAddMilestone = () => {
		const currentMilestones = form.getValues('milestones')
		const updatedMilestones = [...currentMilestones, { description: '' }]
		form.setValue('milestones', updatedMilestones)
		setFormData({ milestones: updatedMilestones })
	}

	const handleRemoveMilestone = (index: number) => {
		const currentMilestones = form.getValues('milestones')
		const updatedMilestones = currentMilestones.filter((_, i) => i !== index)
		form.setValue('milestones', updatedMilestones)
		setFormData({ milestones: updatedMilestones })
	}

	const onSubmit = async (payload: z.infer<typeof formSchema>) => {
		setFormData(payload)
		setIsLoading(true)
		setIsSuccessDialogOpen(false)

		const trustlineObject = trustlines.find(
			(tl) => tl.trustline === payload.trustline,
		)

		try {
			if (!signTransaction) {
				throw new Error('Wallet not connected. Please connect your wallet.')
			}

			const platformFeeDecimal = Number(payload.platformFee)
			const data = await initializeEscrow(
				{
					...payload,
					platformFee: platformFeeDecimal.toString(),
					issuer: address,
					trustlineDecimals: trustlineObject?.trustlineDecimals,
					receiverMemo: Number(payload.receiverMemo),
				},
				address,
				signTransaction,
			)

			if (data.status === 'SUCCESS' || data.status === 201) {
				setIsSuccessDialogOpen(true)
				setRecentEscrow({ ...data.escrow, contractId: data.contract_id })
				resetSteps()
				setCurrentStep(1)
				form.reset()
				resetForm()
				router.push('/dashboard/escrow/my-escrows')
				setIsLoading(false)
			} else {
				resetSteps()
				setCurrentStep(1)
				setIsLoading(false)
				setIsSuccessDialogOpen(false)
				toast({
					title: 'Error',
					description: data.message || 'An error occurred',
					variant: 'destructive',
				})
			}
		} catch (error: any) {
			setIsLoading(false)
			setIsSuccessDialogOpen(false)

			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	// Update store whenever form fields change
	const handleFieldChange = (name: string, value: any) => {
		setFormData({ [name]: value })
	}

	const userOptions = useMemo(() => {
		const options = users.map((user) => ({
			value: user.address,
			label: `${user.firstName} ${user.lastName}`,
		}))

		return [{ value: '', label: 'Select an User' }, ...options]
	}, [users])

	const trustlineOptions = useMemo(() => {
		const options = trustlines.map((trustline: Trustline) => ({
			value: trustline.trustline,
			label: trustline.name,
		}))

		return [{ value: '', label: 'Select a Trustline' }, ...options]
	}, [trustlines])

	const toggleField = (field: string, value: boolean) => {
		setShowSelect((prev) => ({ ...prev, [field]: value }))
	}

	return {
		form,
		milestones,
		onSubmit,
		handleAddMilestone,
		handleRemoveMilestone,
		handleFieldChange,
		userOptions,
		trustlineOptions,
		showSelect,
		toggleField,
		isAnyMilestoneEmpty,
	}
}
