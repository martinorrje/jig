import { createClient } from 'jsr:@supabase/supabase-js@2'
import { defaultPlanningSteps } from './planning/defaultPlanningSteps.ts'
import { runHardwarePlanningPipeline } from './planning/runHardwarePlanningPipeline.ts'

const productionOrigin = 'https://jig-rose.vercel.app'

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  productionOrigin,
])

type CorsHeaders = ReturnType<typeof getCorsHeaders>

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin')

  return {
    'Access-Control-Allow-Origin':
      origin && allowedOrigins.has(origin) ? origin : productionOrigin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

Deno.serve(async (request) => {
  const corsHeaders = getCorsHeaders(request)

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders)
  }

  const user = await getAuthenticatedUser(request)

  if (!user) {
    return json({ error: 'Authentication required' }, 401, corsHeaders)
  }

  if (!isAllowedTester(user)) {
    return json(
      { error: 'You are not on the tester allowlist' },
      403,
      corsHeaders,
    )
  }

  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt) {
      return json({ error: 'Prompt is required' }, 400, corsHeaders)
    }

    const plan = await runHardwarePlanningPipeline(prompt, defaultPlanningSteps)

    return json({ plan }, 200, corsHeaders)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: message }, 500, corsHeaders)
  }
})

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return null
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

type AuthIdentity = {
  id?: string
  provider: string
  identity_data?: {
    provider_id?: string
    sub?: string
  }
}

function isAllowedTester(user: { identities?: AuthIdentity[] }) {
  const githubUserId = getGithubUserId(user)

  if (!githubUserId) {
    return false
  }

  return getAllowedGithubUserIds().has(githubUserId)
}

function getGithubUserId(user: { identities?: AuthIdentity[] }) {
  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === 'github',
  )

  return (
    githubIdentity?.identity_data?.provider_id ??
    githubIdentity?.identity_data?.sub ??
    githubIdentity?.id ??
    null
  )
}

function getAllowedGithubUserIds() {
  const value = Deno.env.get('ALLOWED_GITHUB_USER_IDS') ?? ''

  return new Set(
    value
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )
}

function json(body: unknown, status: number, corsHeaders: CorsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
