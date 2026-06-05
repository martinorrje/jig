import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { HardwarePlan, HardwareSpec } from '../model/types'
import { isHardwareSpec } from '../../supabase/functions/_shared/hardwareSpecContract'
import {
  isHardwarePlan,
  normalizeHardwarePlan,
} from '../../supabase/functions/_shared/hardwarePlanContract'

export type Project = {
  id: string
  title: string
  prompt: string
  spec: HardwareSpec
  plan?: HardwarePlan
  cad?: ProjectCadState
  createdAt: string
  updatedAt: string
}

type GenerateSpecResponse = {
  plan: HardwarePlan
}

type GenerateCadResponse = {
  cad: RawCadResult
}

export type ProjectCadState =
  | { status: 'loading' }
  | {
      status: 'ready'
      build123dCode: string
      workerResult: CadWorkerResult
    }
  | { status: 'skipped'; reason: string; build123dCode?: string }
  | { status: 'error'; message: string }

type RawCadResult = {
  status?: unknown
  reason?: unknown
  build123dCode?: unknown
  workerResult?: unknown
}

export type CadWorkerResult = {
  storage?: {
    step?: CadStorageObject
    stl?: CadStorageObject
  }
}

export type CadStorageObject = {
  bucket: string
  path: string
}

export const PROJECT_UPDATED_EVENT = 'jig.projectUpdated'
const PROJECT_STORAGE_PREFIX = 'jig.localProject.'

export async function createProjectFromPrompt(prompt: string): Promise<Project> {
  const trimmedPrompt = prompt.trim()

  if (!trimmedPrompt) {
    throw new Error('Describe the hardware you want to specify first.')
  }

  const { data, error } =
    await supabase.functions.invoke<GenerateSpecResponse>('generate-hardware', {
      body: { mode: 'plan', prompt: trimmedPrompt },
    })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  if (!data?.plan) {
    throw new Error('No plan was returned.')
  }

  const { plan } = data
  const now = new Date().toISOString()
  const project: Project = {
    id: createProjectId(),
    title: plan.spec.title,
    prompt: trimmedPrompt,
    spec: plan.spec,
    plan,
    cad: { status: 'loading' },
    createdAt: now,
    updatedAt: now,
  }

  saveLocalProject(project)

  return project
}

export async function generateCadForProject(projectId: string): Promise<Project> {
  const project = await loadProject(projectId)

  if (!project.plan) {
    throw new Error('Project has no plan to generate CAD from.')
  }

  try {
    const { data, error } =
      await supabase.functions.invoke<GenerateCadResponse>('generate-hardware', {
        body: {
          mode: 'cad',
          prompt: project.prompt,
          plan: project.plan,
        },
      })

    if (error) {
      throw new Error(await getFunctionErrorMessage(error))
    }

    if (!data?.cad) {
      throw new Error('No CAD result was returned.')
    }

    return updateLocalProject({
      ...project,
      cad: normalizeCadResult(data.cad),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate CAD.'

    return updateLocalProject({
      ...project,
      cad: { status: 'error', message },
      updatedAt: new Date().toISOString(),
    })
  }
}

export async function loadProject(projectId: string): Promise<Project> {
  const project = readLocalProject(projectId)

  if (!project) {
    throw new Error('Project not found.')
  }

  return project
}

function saveLocalProject(project: Project) {
  getLocalProjectStorage().setItem(
    `${PROJECT_STORAGE_PREFIX}${project.id}`,
    JSON.stringify(project),
  )

  if (
    typeof globalThis.dispatchEvent === 'function' &&
    typeof globalThis.CustomEvent === 'function'
  ) {
    globalThis.dispatchEvent(
      new CustomEvent(PROJECT_UPDATED_EVENT, {
        detail: { projectId: project.id },
      }),
    )
  }
}

function updateLocalProject(project: Project) {
  saveLocalProject(project)
  return project
}

function readLocalProject(projectId: string) {
  const rawProject = getLocalProjectStorage().getItem(
    `${PROJECT_STORAGE_PREFIX}${projectId}`,
  )

  if (!rawProject) {
    return null
  }

  try {
    const project = JSON.parse(rawProject) as unknown
    return normalizeStoredProject(project)
  } catch {
    return null
  }
}

function getLocalProjectStorage() {
  if (typeof globalThis.sessionStorage !== 'undefined') {
    return globalThis.sessionStorage
  }

  return memoryStorage
}

const memoryStorage: Storage = (() => {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
})()

function createProjectId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function getFunctionErrorMessage(error: Error) {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as unknown

      if (isErrorResponse(body)) {
        return body.error
      }
    } catch {
      return error.message
    }
  }

  return error.message
}

function normalizeStoredProject(value: unknown): Project | null {
  if (!value || typeof value !== 'object') return null

  const project = value as Record<string, unknown>

  if (
    typeof project.id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.prompt === 'string' &&
    isHardwareSpec(project.spec) &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string'
  ) {
    const normalizedProject: Project = {
      id: project.id,
      title: project.title,
      prompt: project.prompt,
      spec: project.spec,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }

    const normalizedPlan = normalizeHardwarePlan(project.plan)

    if (isHardwarePlan(normalizedPlan)) {
      normalizedProject.plan = normalizedPlan
    }

    if (isProjectCadState(project.cad)) {
      normalizedProject.cad = project.cad
    }

    return normalizedProject
  }

  return null
}

function normalizeCadResult(cad: RawCadResult): ProjectCadState {
  if (
    cad.status === 'succeeded' &&
    typeof cad.build123dCode === 'string' &&
    isCadWorkerResult(cad.workerResult)
  ) {
    return {
      status: 'ready',
      build123dCode: cad.build123dCode,
      workerResult: cad.workerResult,
    }
  }

  if (cad.status === 'skipped' && typeof cad.reason === 'string') {
    const skippedCad: ProjectCadState = {
      status: 'skipped',
      reason: cad.reason,
    }

    if (typeof cad.build123dCode === 'string') {
      skippedCad.build123dCode = cad.build123dCode
    }

    return skippedCad
  }

  return { status: 'error', message: 'CAD result was invalid.' }
}

function isProjectCadState(value: unknown): value is ProjectCadState {
  if (!value || typeof value !== 'object') return false

  const cad = value as Record<string, unknown>

  if (cad.status === 'loading') return true
  if (cad.status === 'error') return typeof cad.message === 'string'
  if (cad.status === 'skipped') return typeof cad.reason === 'string'

  return (
    cad.status === 'ready' &&
    typeof cad.build123dCode === 'string' &&
    isCadWorkerResult(cad.workerResult)
  )
}

function isCadWorkerResult(value: unknown): value is CadWorkerResult {
  if (!value || typeof value !== 'object') return false

  const result = value as Record<string, unknown>

  if (result.storage === undefined) return true
  if (!result.storage || typeof result.storage !== 'object') return false

  const storage = result.storage as Record<string, unknown>

  return (
    (storage.step === undefined || isCadStorageObject(storage.step)) &&
    (storage.stl === undefined || isCadStorageObject(storage.stl))
  )
}

function isCadStorageObject(value: unknown): value is CadStorageObject {
  if (!value || typeof value !== 'object') return false

  const object = value as Record<string, unknown>

  return typeof object.bucket === 'string' && typeof object.path === 'string'
}

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { error?: unknown }).error === 'string'
  )
}
