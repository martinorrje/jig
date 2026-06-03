import {
  hardwareSpecSchema,
  isHardwareSpec,
  type HardwareSpec,
} from '../../_shared/hardwareSpecContract.ts'
import { buildPrompt } from '../prompt.ts'

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export async function generateSpecWithGemini(
  prompt: string,
): Promise<HardwareSpec> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash'

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(prompt),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: hardwareSpecSchema,
        },
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini request failed: ${response.status} ${body}`)
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini returned no text')
  }

  const parsed = JSON.parse(text)

  if (!isHardwareSpec(parsed)) {
    throw new Error('Gemini returned an invalid hardware spec')
  }

  return parsed
}
