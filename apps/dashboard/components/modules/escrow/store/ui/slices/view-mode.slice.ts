import type { StateCreator } from 'zustand'
import type { ViewModeEscrowStore } from '../@types/view-mode.entity'

export const useEscrowViewModeSlice: StateCreator<
	ViewModeEscrowStore,
	[['zustand/devtools', never]],
	[],
	ViewModeEscrowStore
> = (set) => {
	return {
		// Stores
		activeMode: 'cards',

		// Modifiers
		setActiveMode: (value: 'table' | 'cards') => set({ activeMode: value }),
	}
}
