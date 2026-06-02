import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { HardwareSpec } from '../model/types'

type SpecStatus = 'idle' | 'generating' | 'ready' | 'error'

type SpecState = {
  prompt: string
  currentSpec: HardwareSpec | null
  status: SpecStatus
  errorMessage: string | null
  setPrompt: (prompt: string) => void
  generateSpec: () => Promise<boolean>
  clearSpec: () => void
}

type GenerateSpecResponse = {
  spec: HardwareSpec
}

export const useSpecStore = create<SpecState>((set, get) => ({
  prompt: '',
  currentSpec: null,
  status: 'idle',
  errorMessage: null,

  setPrompt: (prompt) => {
    set({ prompt, errorMessage: null })
  },

  generateSpec: async () => {
    const prompt = get().prompt.trim()

    if (!prompt) {
      set({
        status: 'error',
        errorMessage: 'Describe the hardware you want to specify first.',
      })
      return false
    }

    set({
      currentSpec: null,
      status: 'generating',
      errorMessage: null,
    })

    try {
      const { data, error } =
        await supabase.functions.invoke<GenerateSpecResponse>('generate-spec', {
          body: { prompt },
        })

      if (error) {
        set({
          status: 'error',
          errorMessage: error.message,
        })
        return false
      }

      if (!data?.spec) {
        set({
          status: 'error',
          errorMessage: 'No spec was returned.',
        })
        return false
      }

      set({
        currentSpec: data.spec,
        status: 'ready',
        errorMessage: null,
      })

      return true
    } catch (error) {
      set({
        status: 'error',
        errorMessage:
          error instanceof Error ? error.message : 'Failed to generate spec.',
      })
      return false
    }
  },

  clearSpec: () => {
    set({
      currentSpec: null,
      status: 'idle',
      errorMessage: null,
    })
  },
}))
