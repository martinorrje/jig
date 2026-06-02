import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'
import { useSpecStore } from '../store/specStore'

export function HomePage() {
  const navigate = useNavigate()
  const ready = useAuthStore((state) => state.ready)
  const user = useAuthStore((state) => state.user)
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub)
  const prompt = useSpecStore((state) => state.prompt)
  const errorMessage = useSpecStore((state) => state.errorMessage)
  const setPrompt = useSpecStore((state) => state.setPrompt)
  const generateMockSpec = useSpecStore((state) => state.generateMockSpec)

  const canGenerate = ready && Boolean(user)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canGenerate) {
      void signInWithGitHub()
      return
    }

    generateMockSpec()

    if (useSpecStore.getState().currentSpec) {
      void navigate({ to: '/specs/new' })
    }
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
            placeholder="Example: Design a low-cost desktop filament dryer for hobby 3D printing..."
            rows={7}
          />

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="prompt-actions">
            <button
              type="submit"
              className="generate-button"
              disabled={!ready}
            >
              {user ? 'Generate spec' : 'Sign in to generate'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
