import { FunctionsHttpError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HardwareSpec } from '../model/types'
import { supabase } from '../lib/supabase'
import { createProjectFromPrompt, loadProject } from './projectService'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(),
  },
}))

const getUser = vi.mocked(supabase.auth.getUser)
const invokeFunction = vi.mocked(supabase.functions.invoke)
const from = vi.mocked(supabase.from)

const spec: HardwareSpec = {
  title: 'Desktop Filament Dryer',
  summary: 'A compact dryer for desktop 3D printing filament.',
  requirements: ['Dry filament at controlled temperatures.'],
  constraints: ['Keep the enclosure suitable for desktop use.'],
  assumptions: ['The user wants hobby-scale operation.'],
  risks: ['Poor thermal control could damage filament.'],
  nextSteps: ['Confirm target spool sizes.'],
}

describe('projectService', () => {
  beforeEach(() => {
    getUser.mockReset()
    invokeFunction.mockReset()
    from.mockReset()
  })

  it('generates a spec and saves it as a user-owned project', async () => {
    const insert = vi.fn()
    const select = vi.fn()
    const single = vi.fn().mockResolvedValue({
      data: projectRow(),
      error: null,
    })

    getUser.mockResolvedValue({
      data: { user: testUser() },
      error: null,
    })
    invokeFunction.mockResolvedValue({
      data: { spec },
      error: null,
    })
    from.mockReturnValue({ insert } as never)
    insert.mockReturnValue({ select })
    select.mockReturnValue({ single })

    const project = await createProjectFromPrompt(' desktop filament dryer ')

    expect(invokeFunction).toHaveBeenCalledWith('generate-spec', {
      body: { prompt: 'desktop filament dryer' },
    })
    expect(from).toHaveBeenCalledWith('projects')
    expect(insert).toHaveBeenCalledWith({
      owner_id: 'user-1',
      title: spec.title,
      prompt: 'desktop filament dryer',
      spec,
    })
    expect(project).toEqual({
      id: 'project-1',
      title: spec.title,
      prompt: 'desktop filament dryer',
      spec,
      createdAt: '2026-06-02T14:00:00Z',
      updatedAt: '2026-06-02T14:00:00Z',
    })
  })

  it('loads one project by id', async () => {
    const select = vi.fn()
    const eq = vi.fn()
    const single = vi.fn().mockResolvedValue({
      data: projectRow(),
      error: null,
    })

    from.mockReturnValue({ select } as never)
    select.mockReturnValue({ eq })
    eq.mockReturnValue({ single })

    const project = await loadProject('project-1')

    expect(from).toHaveBeenCalledWith('projects')
    expect(select).toHaveBeenCalledWith(
      'id,title,prompt,spec,created_at,updated_at',
    )
    expect(eq).toHaveBeenCalledWith('id', 'project-1')
    expect(project.id).toBe('project-1')
    expect(project.spec).toEqual(spec)
  })

  it('surfaces edge function response errors', async () => {
    getUser.mockResolvedValue({
      data: { user: testUser() },
      error: null,
    })
    invokeFunction.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError(
        new Response(JSON.stringify({ error: 'Not allowed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    })

    await expect(createProjectFromPrompt('dryer')).rejects.toThrow(
      'Not allowed',
    )
  })
})

function testUser() {
  return {
    id: 'user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-06-02T14:00:00Z',
  }
}

function projectRow() {
  return {
    id: 'project-1',
    title: spec.title,
    prompt: 'desktop filament dryer',
    spec,
    created_at: '2026-06-02T14:00:00Z',
    updated_at: '2026-06-02T14:00:00Z',
  }
}
