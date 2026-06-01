import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthState = {
  ready: boolean
  session: Session | null
  user: User | null
  initAuth: () => () => void
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  session: null,
  user: null,

  initAuth: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({
        ready: true,
        session: data.session,
        user: data.session?.user ?? null,
      })
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        ready: true,
        session,
        user: session?.user ?? null,
      })
    })

    return () => data.subscription.unsubscribe()
  },

  signInWithGitHub: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
  },
}))