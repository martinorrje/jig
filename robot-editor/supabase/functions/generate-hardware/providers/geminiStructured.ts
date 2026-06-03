type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

type StructuredObjectRequest<T> = {
  prompt: string
  schema: unknown
  validate: (value: unknown) => value is T
  invalidMessage: string
  retryDelayMs?: number
}

const maxAttempts = 3

export async function generateStructuredObject<T>({
  prompt,
  schema,
  validate,
  invalidMessage,
  retryDelayMs = 400,
}: StructuredObjectRequest<T>): Promise<T> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash'

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const request = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseJsonSchema: schema,
    },
  }

  let response: Response | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(request),
      },
    )

    if (response.ok || !isRetryableStatus(response.status)) {
      break
    }

    if (attempt < maxAttempts) {
      await delay(retryDelayMs * attempt)
    }
  }

  if (!response) {
    throw new Error('Gemini request was not sent')
  }

  if (!response.ok) {
    throw new Error(await createGeminiErrorMessage(response))
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini returned no text')
  }

  const parsed = JSON.parse(text) as unknown

  if (!validate(parsed)) {
    throw new Error(invalidMessage)
  }

  return parsed
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

async function createGeminiErrorMessage(response: Response) {
  const body = await response.text()

  if (isRetryableStatus(response.status)) {
    return 'Gemini is temporarily unavailable. Please try again in a minute.'
  }

  return `Gemini request failed: ${response.status} ${body}`
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
