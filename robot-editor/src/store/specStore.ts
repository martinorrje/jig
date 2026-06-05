import { create } from 'zustand'
import {
  createProjectFromPrompt,
  generateCadForProject,
} from '../services/projectService'

type SpecStatus = 'idle' | 'generating' | 'ready' | 'error'

type SpecState = {
  prompt: string
  status: SpecStatus
  errorMessage: string | null
  setPrompt: (prompt: string) => void
  createProject: () => Promise<string | null>
  reset: () => void
}

export const useSpecStore = create<SpecState>((set, get) => ({
  prompt: '',
  status: 'idle',
  errorMessage: null,

  setPrompt: (prompt) => {
    set({ prompt, errorMessage: null })
  },

  createProject: async () => {
    const prompt = get().prompt.trim()

    if (!prompt) {
      set({
        status: 'error',
        errorMessage: 'Describe the hardware you want to specify first.',
      })
      return null
    }

    set({
      status: 'generating',
      errorMessage: null,
    })

    try {
      const project = await createProjectFromPrompt(prompt)

      void generateCadForProject(project.id)

      set({
        status: 'ready',
        errorMessage: null,
      })

      return project.id
    } catch (error) {
      set({
        status: 'error',
        errorMessage:
          error instanceof Error ? error.message : 'Failed to generate spec.',
      })
      return null
    }
  },

  reset: () => {
    set({
      prompt: '',
      status: 'idle',
      errorMessage: null,
    })
  },
}))
