import {
  hardwareSpecSchema,
  isHardwareSpec,
  type HardwareSpec,
} from '../hardwareSpecSchema.ts'

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

function buildPrompt(prompt: string) {
  return `
Create a practical hardware specification from the user prompt.

Rules:
- Be specific and engineering-oriented.
- Do not invent exact dimensions, prices, certifications, or part numbers unless the prompt provides them.
- Prefer clear assumptions over hidden guesses.
- Keep each list item concise.
- Return only the structured JSON object required by the schema.

User prompt:
${prompt}
`.trim()
}
