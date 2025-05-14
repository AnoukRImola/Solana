import { create } from 'zustand'
import { type DevtoolsOptions, devtools } from 'zustand/middleware'
import type { AmountEscrowStore } from './@types/amounts.entity'
import type { DialogEscrowStore } from './@types/dialogs.entity'
import type { InitializeFormEscrowStore } from './@types/initialize-form.entity'
import type { LoadersEscrowStore } from './@types/loaders.entity'
import type { StepsEscrowStore } from './@types/steps.entity'
import type { TabsEscrowStore } from './@types/tabs.entity'
import type { ViewModeEscrowStore } from './@types/view-mode.entity'
import { useEscrowAmountSlice } from './slices/amounts.slice'
import { useEscrowDialogSlice } from './slices/dialogs.slice'
import { useEscrowInitializeFormSlice } from './slices/initialize-form.slice'
import { useEscrowLoadersSlice } from './slices/loaders.slice'
import { useEscrowStepsSlice } from './slices/steps.slice'
import { useEscrowTabSlice } from './slices/tabs.slice'
import { useEscrowViewModeSlice } from './slices/view-mode.slice'

type GlobalState = DialogEscrowStore &
	TabsEscrowStore &
	ViewModeEscrowStore &
	LoadersEscrowStore &
	InitializeFormEscrowStore &
	StepsEscrowStore &
	AmountEscrowStore

const devtoolsOptions: DevtoolsOptions = {
	name: 'Global State',
	serialize: {
		options: {
			undefined: true,
			function: false,
			symbol: false,
			error: true,
			date: true,
			regexp: true,
			bigint: true,
			map: true,
			set: true,
			depth: 10,
			maxSize: 50000,
		},
	},
	enabled: process.env.NODE_ENV === 'development',
	anonymousActionType: 'Unknown',
	stateSanitizer: (state: GlobalState) => {
		return {
			...state,
			notificationsApi: '<NOTIFICATIONS_API>',
			contextHolder: '<CONTEXT_HOLDER>',
		}
	},
}

export const useEscrowUIBoundedStore = create<GlobalState>()(
	devtools(
		(...a) => ({
			...useEscrowDialogSlice(...a),
			...useEscrowTabSlice(...a),
			...useEscrowViewModeSlice(...a),
			...useEscrowLoadersSlice(...a),
			...useEscrowInitializeFormSlice(...a),
			...useEscrowStepsSlice(...a),
			...useEscrowAmountSlice(...a),
		}),
		devtoolsOptions,
	),
)
