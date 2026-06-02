import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProjectFromPrompt } from '../services/projectService'
import { useSpecStore } from './specStore'

vi.mock('../services/projectService', () => ({
  createProjectFromPrompt: vi.fn(),
}))

const createProject = vi.mocked(createProjectFromPrompt)

describe('specStore', () => {
  beforeEach(() => {
    createProject.mockReset()
    useSpecStore.setState({
      prompt: '',
      status: 'idle',
      errorMessage: null,
    })
  })

  it('creates a project from the prompt and returns its id', async () => {
    createProject.mockResolvedValue({
      id: 'project-1',
      title: 'Desktop Filament Dryer',
      prompt: 'desktop filament dryer',
      spec: {
        title: 'Desktop Filament Dryer',
        summary: 'A compact dryer for desktop 3D printing filament.',
        requirements: ['Dry filament at controlled temperatures.'],
        constraints: ['Keep the enclosure suitable for desktop use.'],
        assumptions: ['The user wants hobby-scale operation.'],
        risks: ['Poor thermal control could damage filament.'],
        nextSteps: ['Confirm target spool sizes.'],
      },
      createdAt: '2026-06-02T14:00:00Z',
      updatedAt: '2026-06-02T14:00:00Z',
    })

    useSpecStore.getState().setPrompt(' desktop filament dryer ')

    const projectId = await useSpecStore.getState().createProject()

    const state = useSpecStore.getState()
    expect(projectId).toBe('project-1')
    expect(createProject).toHaveBeenCalledWith('desktop filament dryer')
    expect(state.status).toBe('ready')
    expect(state.errorMessage).toBeNull()
  })

  it('shows an error instead of creating a project for an empty prompt', async () => {
    const projectId = await useSpecStore.getState().createProject()

    const state = useSpecStore.getState()
    expect(projectId).toBeNull()
    expect(createProject).not.toHaveBeenCalled()
    expect(state.status).toBe('error')
    expect(state.errorMessage).toBe('Describe the hardware you want to specify first.')
  })

  it('stores service errors', async () => {
    createProject.mockRejectedValue(new Error('Authentication required'))

    useSpecStore.getState().setPrompt('desktop filament dryer')

    const projectId = await useSpecStore.getState().createProject()

    const state = useSpecStore.getState()
    expect(projectId).toBeNull()
    expect(state.status).toBe('error')
    expect(state.errorMessage).toBe('Authentication required')
  })
})
