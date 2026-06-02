import { Link } from '@tanstack/react-router'
import { useSpecStore } from '../store/specStore'

const specSections = [
  ['Requirements', 'requirements'],
  ['Constraints', 'constraints'],
  ['Assumptions', 'assumptions'],
  ['Risks', 'risks'],
  ['Next steps', 'nextSteps'],
] as const

export function SpecsPage() {
  const prompt = useSpecStore((state) => state.prompt)
  const spec = useSpecStore((state) => state.currentSpec)

  if (!spec) {
    return (
      <main className="spec-page spec-empty-page">
        <section className="empty-state">
          <p className="eyebrow">No active spec</p>
          <h1>Create a hardware spec first</h1>
          <p>
            Start from a prompt so the spec page has a structured brief to show.
          </p>
          <Link className="secondary-link" to="/">
            Back to prompt
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="spec-page">
      <section className="spec-layout">
        <article className="spec-document">
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
