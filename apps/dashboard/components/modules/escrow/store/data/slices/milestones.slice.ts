import type { StateCreator } from 'zustand'
import type { Milestone } from '~/@types/escrow.entity'
import type { MilestonesEscrowStore } from '../@types/milestones.entity'

export const useEscrowMilestoneSlice: StateCreator<
	MilestonesEscrowStore,
	[['zustand/devtools', never]],
	[],
	MilestonesEscrowStore
> = (set) => {
	return {
		// Stores
		completingMilestone: null,
		milestoneIndex: null,

		// Modifiers
		setCompletingMilestone: (value: Milestone | null) =>
			set({ completingMilestone: value }),
		setMilestoneIndex: (value: number | null) => set({ milestoneIndex: value }),
	}
}
