import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { HardwareSpec } from '../model/types'

export type Project = {
  id: string
  title: string
  prompt: string
  spec: HardwareSpec
  createdAt: string
  updatedAt: string
}

type GenerateSpecResponse = {
  spec: HardwareSpec
}

const PROJECT_STORAGE_PREFIX = 'jig.localProject.'

export async function createProjectFromPrompt(prompt: string): Promise<Project> {
  const trimmedPrompt = prompt.trim()

  if (!trimmedPrompt) {
    throw new Error('Describe the hardware you want to specify first.')
  }

  const { data, error } =
    await supabase.functions.invoke<GenerateSpecResponse>('generate-spec', {
      body: { prompt: trimmedPrompt },
    })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  if (!data?.spec) {
    throw new Error('No spec was returned.')
  }

  const now = new Date().toISOString()
  const project = {
    id: createProjectId(),
    title: data.spec.title,
    prompt: trimmedPrompt,
    spec: data.spec,
    createdAt: now,
    updatedAt: now,
  }

  saveLocalProject(project)

  return project
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
    return isProject(project) ? project : null
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

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false

  const project = value as Record<string, unknown>

  return (
    typeof project.id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.prompt === 'string' &&
    isHardwareSpec(project.spec) &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string'
  )
}

function isHardwareSpec(value: unknown): value is HardwareSpec {
  if (!value || typeof value !== 'object') return false

  const spec = value as Record<string, unknown>

  return (
    typeof spec.title === 'string' &&
    typeof spec.summary === 'string' &&
    isStringArray(spec.requirements) &&
    isStringArray(spec.constraints) &&
    isStringArray(spec.assumptions) &&
    isStringArray(spec.risks) &&
    isStringArray(spec.nextSteps)
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { error?: unknown }).error === 'string'
  )
}
