import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import { useSpecStore } from '../store/specStore'
import { formatElapsedTime } from '../utils/time'
import { useElapsedSeconds } from '../utils/useElapsedSeconds'

export function HomePage() {
  const navigate = useNavigate()
  const ready = useAuthStore((state) => state.ready)
  const user = useAuthStore((state) => state.user)
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub)
  const prompt = useSpecStore((state) => state.prompt)
  const status = useSpecStore((state) => state.status)
  const errorMessage = useSpecStore((state) => state.errorMessage)
  const setPrompt = useSpecStore((state) => state.setPrompt)
  const createProject = useSpecStore((state) => state.createProject)

  const canGenerate = ready && Boolean(user)
  const isGenerating = status === 'generating'
  const elapsedSeconds = useElapsedSeconds(isGenerating)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canGenerate) {
      void signInWithGitHub()
      return
    }

    const projectId = await createProject()

    if (projectId) {
      void navigate({
        to: '/specs/$projectId',
        params: { projectId },
      })
    }
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <main className="home-page">
      <section className="prompt-hero" aria-labelledby="prompt-title">
        <div className="hero-copy">
          <p className="eyebrow">Hardware specification workspace</p>
          <h1 id="prompt-title">What hardware do you want to specify?</h1>
        </div>

        <form className="prompt-panel" onSubmit={handleSubmit}>
          <label className="prompt-label" htmlFor="hardware-prompt">
            Hardware prompt
          </label>

          <textarea
            id="hardware-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handlePromptKeyDown}
            placeholder="Example: Design a low-cost desktop filament dryer for hobby 3D printing..."
            rows={7}
          />

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="prompt-actions">
            <p className="generation-status" aria-live="polite">
              {isGenerating
                ? `Generating plan... ${formatElapsedTime(elapsedSeconds)}`
                : 'Plan generation starts first. CAD renders after the spec is ready.'}
            </p>
            <button
              type="submit"
              className="generate-button"
              disabled={!ready || isGenerating}
            >
              {isGenerating
                ? 'Generating...'
                : user
                  ? 'Generate spec'
                  : 'Sign in to generate'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
