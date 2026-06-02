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

type ProjectRow = {
  id: string
  title: string
  prompt: string
  spec: HardwareSpec
  created_at: string
  updated_at: string
}

const PROJECT_SELECT = 'id,title,prompt,spec,created_at,updated_at'

export async function createProjectFromPrompt(prompt: string): Promise<Project> {
  const trimmedPrompt = prompt.trim()

  if (!trimmedPrompt) {
    throw new Error('Describe the hardware you want to specify first.')
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw new Error('Authentication required')
  }

  const { data: generated, error: generateError } =
    await supabase.functions.invoke<GenerateSpecResponse>('generate-spec', {
      body: { prompt: trimmedPrompt },
    })

  if (generateError) {
    throw new Error(await getFunctionErrorMessage(generateError))
  }

  if (!generated?.spec) {
    throw new Error('No spec was returned.')
  }

  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      owner_id: userData.user.id,
      title: generated.spec.title,
      prompt: trimmedPrompt,
      spec: generated.spec,
    })
    .select(PROJECT_SELECT)
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  if (!project) {
    throw new Error('No project was saved.')
  }

  return toProject(project)
}

export async function loadProject(projectId: string): Promise<Project> {
  const { data: project, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!project) {
    throw new Error('Project not found.')
  }

  return toProject(project)
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    spec: row.spec,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as { error?: unknown }).error === 'string'
  )
}
