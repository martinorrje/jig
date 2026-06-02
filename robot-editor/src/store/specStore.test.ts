import { FunctionsHttpError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HardwareSpec } from '../model/types'
import { supabase } from '../lib/supabase'
import { useSpecStore } from './specStore'

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}))

const invokeFunction = vi.mocked(supabase.functions.invoke)

describe('specStore', () => {
  beforeEach(() => {
    invokeFunction.mockReset()
    useSpecStore.setState({
      prompt: '',
      currentSpec: null,
      status: 'idle',
      errorMessage: null,
    })
  })

  it('stores the generated hardware spec returned by the edge function', async () => {
    const spec: HardwareSpec = {
      title: 'Desktop Filament Dryer',
      summary: 'A compact dryer for desktop 3D printing filament.',
      requirements: ['Dry filament at controlled temperatures.'],
      constraints: ['Keep the enclosure suitable for desktop use.'],
      assumptions: ['The user wants hobby-scale operation.'],
      risks: ['Poor thermal control could damage filament.'],
      nextSteps: ['Confirm target spool sizes.'],
    }

    invokeFunction.mockResolvedValue({
      data: { spec },
      error: null,
    })

    useSpecStore.getState().setPrompt('desktop filament dryer')

    const didGenerate = await useSpecStore.getState().generateSpec()

    const state = useSpecStore.getState()
    expect(didGenerate).toBe(true)
    expect(invokeFunction).toHaveBeenCalledWith('generate-spec', {
      body: { prompt: 'desktop filament dryer' },
    })
    expect(state.status).toBe('ready')
    expect(state.errorMessage).toBeNull()
    expect(state.currentSpec).toEqual(spec)
  })

  it('shows an error instead of invoking the edge function for an empty prompt', async () => {
    const didGenerate = await useSpecStore.getState().generateSpec()

    const state = useSpecStore.getState()
    expect(didGenerate).toBe(false)
    expect(invokeFunction).not.toHaveBeenCalled()
    expect(state.status).toBe('error')
    expect(state.currentSpec).toBeNull()
    expect(state.errorMessage).toBe('Describe the hardware you want to specify first.')
  })

  it('stores an error when the edge function fails', async () => {
    invokeFunction.mockResolvedValue({
      data: null,
      error: new Error('Authentication required'),
    })

    useSpecStore.getState().setPrompt('desktop filament dryer')

    const didGenerate = await useSpecStore.getState().generateSpec()

    const state = useSpecStore.getState()
    expect(didGenerate).toBe(false)
    expect(state.status).toBe('error')
    expect(state.currentSpec).toBeNull()
    expect(state.errorMessage).toBe('Authentication required')
  })

  it('shows the edge function error response body for non-2xx responses', async () => {
    invokeFunction.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError(
        new Response(
          JSON.stringify({ error: 'You are not on the tester allowlist' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    })

    useSpecStore.getState().setPrompt('desktop filament dryer')

    const didGenerate = await useSpecStore.getState().generateSpec()

    const state = useSpecStore.getState()
    expect(didGenerate).toBe(false)
    expect(state.status).toBe('error')
    expect(state.currentSpec).toBeNull()
    expect(state.errorMessage).toBe('You are not on the tester allowlist')
  })
})
