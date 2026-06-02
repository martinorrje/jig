import { beforeEach, describe, expect, it } from 'vitest'
import { useSpecStore } from './specStore'

describe('specStore', () => {
  beforeEach(() => {
    useSpecStore.setState({
      prompt: '',
      currentSpec: null,
      status: 'idle',
      errorMessage: null,
    })
  })

  it('creates a structured local hardware spec from a prompt', () => {
    useSpecStore.getState().setPrompt('desktop filament dryer')

    useSpecStore.getState().generateMockSpec()

    const state = useSpecStore.getState()
    expect(state.status).toBe('ready')
    expect(state.errorMessage).toBeNull()
    expect(state.currentSpec?.title).toBe('Desktop Filament Dryer')
    expect(state.currentSpec?.requirements.length).toBeGreaterThan(0)
    expect(state.currentSpec?.nextSteps.length).toBeGreaterThan(0)
  })

  it('shows an error instead of creating a spec for an empty prompt', () => {
    useSpecStore.getState().generateMockSpec()

    const state = useSpecStore.getState()
    expect(state.status).toBe('error')
    expect(state.currentSpec).toBeNull()
    expect(state.errorMessage).toBe('Describe the hardware you want to specify first.')
  })
})
