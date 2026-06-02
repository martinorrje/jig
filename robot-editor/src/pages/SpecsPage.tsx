import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { loadProject, type Project } from '../services/projectService'

const specSections = [
  ['Requirements', 'requirements'],
  ['Constraints', 'constraints'],
  ['Assumptions', 'assumptions'],
  ['Risks', 'risks'],
  ['Next steps', 'nextSteps'],
] as const

type ProjectLoadState =
  | { projectId: string; status: 'loading' }
  | { projectId: string; status: 'ready'; project: Project }
  | { projectId: string; status: 'error'; message: string }

export function SpecsPage() {
  const { projectId } = useParams({ from: '/specs/$projectId' })
  const [loadState, setLoadState] = useState<ProjectLoadState>({
    projectId,
    status: 'loading',
  })

  useEffect(() => {
    let active = true

    loadProject(projectId)
      .then((project) => {
        if (active) {
          setLoadState({ projectId, status: 'ready', project })
        }
      })
      .catch((error) => {
        if (active) {
          setLoadState({
            projectId,
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Failed to load project.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [projectId])

  const state: ProjectLoadState =
    loadState.projectId === projectId
      ? loadState
      : { projectId, status: 'loading' }

  if (state.status === 'loading') {
    return (
      <main className="spec-page spec-empty-page">
        <section className="empty-state">
          <p className="eyebrow">Loading spec</p>
          <h1>Loading hardware spec</h1>
        </section>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="spec-page spec-empty-page">
        <section className="empty-state">
          <p className="eyebrow">Spec unavailable</p>
          <h1>Could not load this spec</h1>
          <p>{state.message}</p>
          <Link className="secondary-link" to="/">
            Back to prompt
          </Link>
        </section>
      </main>
    )
  }

  const { project } = state
  const { spec } = project

  return (
    <main className="spec-page">
      <section className="spec-layout">
        <article className="spec-document">
          <header className="spec-document-header">
            <p className="eyebrow">Hardware spec</p>
            <h1>{project.title}</h1>
          </header>

          <section className="spec-summary">
            <p className="eyebrow">Prompt</p>
            <p>{project.prompt}</p>
          </section>

          <section className="spec-summary">
            <p className="eyebrow">Summary</p>
            <p>{spec.summary}</p>
          </section>

          {specSections.map(([label, key]) => (
            <section className="spec-section" key={key}>
              <h2>{label}</h2>
              <ul>
                {spec[key].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
      </section>
    </main>
  )
}
