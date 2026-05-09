import { create } from 'zustand'
import {
  type DevtoolsOptions,
  createJSONStorage,
  devtools,
  persist
} from 'zustand/middleware'
import type { LoaderGlobalUIStore } from './@types/loader.entity'
import type { NotificationsGlobalUIStore } from './@types/notifications.entity'
import type { StepsGlobalUIStore } from './@types/steps.entity'
import type { ThemeGlobalUIStore } from './@types/theme.entity'
import type { TutorialGlobalUIStore } from './@types/tutorial.entity'
import { useLoaderSlice } from './slices/loader.slice'
import { useNotificationsSlice } from './slices/notifications.slice'
import { useStepsSlice } from './slices/steps.slice'
import { useThemeSlice } from './slices/theme.slice'
import { useTutorialSlice } from './slices/tutorial.slice'

type GlobalUIState = ThemeGlobalUIStore &
  LoaderGlobalUIStore &
  StepsGlobalUIStore &
  TutorialGlobalUIStore &
  NotificationsGlobalUIStore

const devtoolsOptions: DevtoolsOptions = {
  name: 'Global UI State',
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
      maxSize: 50000
    }
  },
  enabled: process.env.NODE_ENV === 'development',
  anonymousActionType: 'Unknown',
  stateSanitizer: (state: GlobalUIState) => {
    return {
      ...state,
      notificationsApi: '<NOTIFICATIONS_API>',
      contextHolder: '<CONTEXT_HOLDER>'
    }
  }
}

export const useGlobalUIBoundedStore = create<GlobalUIState>()(
  persist(
    devtools(
      (...a) => ({
        ...useThemeSlice(...a),
        ...useLoaderSlice(...a),
        ...useStepsSlice(...a),
        ...useTutorialSlice(...a),
        ...useNotificationsSlice(...a)
      }),
      devtoolsOptions
    ),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        theme: state.theme
      })
    }
  )
)
