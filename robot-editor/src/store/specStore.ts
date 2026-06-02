import { create } from 'zustand'
import type { HardwareSpec } from '../model/types'

type SpecStatus = 'idle' | 'generating' | 'ready' | 'error'

type SpecState = {
  prompt: string
  currentSpec: HardwareSpec | null
  status: SpecStatus
  errorMessage: string | null
  setPrompt: (prompt: string) => void
  generateMockSpec: () => void
  clearSpec: () => void
}

export const useSpecStore = create<SpecState>((set, get) => ({
  prompt: '',
  currentSpec: null,
  status: 'idle',
  errorMessage: null,

  setPrompt: (prompt) => {
    set({ prompt, errorMessage: null })
  },

  generateMockSpec: () => {
    const prompt = get().prompt.trim()

    if (!prompt) {
      set({
        status: 'error',
        errorMessage: 'Describe the hardware you want to specify first.',
      })
      return
    }

    set({
      currentSpec: createLocalHardwareSpec(prompt),
      status: 'ready',
      errorMessage: null,
    })
  },

  clearSpec: () => {
    set({
      currentSpec: null,
      status: 'idle',
      errorMessage: null,
    })
  },
}))

function createLocalHardwareSpec(prompt: string): HardwareSpec {
  return {
    title: createTitle(prompt),
    summary: `A first-pass hardware specification for ${prompt}. This draft is structured for review before CAD, electronics, procurement, or manufacturing work begins.`,
    requirements: [
      'Define the primary user workflow and operating environment.',
      'Identify core mechanical, electrical, and enclosure requirements.',
      'List interfaces, mounting points, service access, and safety constraints.',
    ],
    constraints: [
      'Keep early geometry conceptual until explicit dimensions are known.',
      'Avoid hidden manufacturing assumptions before materials are selected.',
      'Separate functional requirements from implementation choices.',
    ],
    assumptions: [
      'The first output is a specification document, not a CAD model.',
      'The design can be refined into subsystems after the brief is approved.',
      'Budget, target materials, and production quantity are still open.',
    ],
    risks: [
      'Ambiguous requirements may lead to incompatible mechanical decisions.',
      'Unspecified operating conditions can affect enclosure and component choices.',
      'Early part choices may constrain future manufacturability.',
    ],
    nextSteps: [
      'Confirm target user, environment, and success criteria.',
      'Break the product into functional subsystems.',
      'Convert accepted requirements into measurable engineering constraints.',
    ],
  }
}

function createTitle(prompt: string) {
  const words = prompt
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)

  if (words.length === 0) return 'Untitled Hardware Spec'

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
