import type { StateCreator } from 'zustand'
import type { ThemeGlobalUIStore } from '../@types/theme.entity'

export const useThemeSlice: StateCreator<
	ThemeGlobalUIStore,
	[['zustand/devtools', never]],
	[],
	ThemeGlobalUIStore
> = (set, get) => {
	return {
		// Stores
		theme: 'light',

		// Modifiers
		toggleTheme: (newTheme?: 'light' | 'dark') => {
			const currentTheme = get().theme
			const themeToSet =
				newTheme || (currentTheme === 'light' ? 'dark' : 'light')
			set({ theme: themeToSet })
		},
	}
}
