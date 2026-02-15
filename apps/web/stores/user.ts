import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  language: string
}

interface UserState {
  preferences: UserPreferences
  setTheme: (theme: UserPreferences['theme']) => void
  toggleEmailNotifications: () => void
  setLanguage: (language: string) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  emailNotifications: true,
  language: 'en',
}

/**
 * Zustand store for client-side user preferences
 *
 * Persisted to localStorage for user experience across sessions
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { useUserStore } from '@/stores/user'
 *
 * export function ThemeToggle() {
 *   const { preferences, setTheme } = useUserStore()
 *
 *   return (
 *     <button onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle Theme
 *     </button>
 *   )
 * }
 * ```
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      setTheme: (theme) => set((state) => ({
        preferences: { ...state.preferences, theme },
      })),

      toggleEmailNotifications: () => set((state) => ({
        preferences: {
          ...state.preferences,
          emailNotifications: !state.preferences.emailNotifications,
        },
      })),

      setLanguage: (language) => set((state) => ({
        preferences: { ...state.preferences, language },
      })),

      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
