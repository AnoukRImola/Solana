import type { StateCreator } from 'zustand'
import type { LoaderGlobalUIStore } from '../@types/loader.entity'

export const useLoaderSlice: StateCreator<
	LoaderGlobalUIStore,
	[['zustand/devtools', never]],
	[],
	LoaderGlobalUIStore
> = (set) => {
	return {
		// Stores
		isLoading: false,

		// Modifiers
		setIsLoading: (isLoading: boolean) => set({ isLoading }),
	}
}
