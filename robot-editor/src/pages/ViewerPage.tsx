import './ViewerPage.css'
import { Link, useParams } from '@tanstack/react-router'
import { RobotViewport } from '../viewport/RobotViewport'
import { SidePane } from '../components/viewport/SidePage'

export function ViewerPage() {
  const { projectId } = useParams({ strict: false })
  const projectTitle = projectId ? `Project ${projectId}` : 'Untitled project'

  return (
    <main className="viewer-page">
      <header className="viewer-topbar">
        <Link className="back-link" to="/">
          Jig
        </Link>

        <h1>{projectTitle}</h1>

        <button type="button" className="save-button">
          Save
        </button>
      </header>

      <section className="viewer-workspace">
        <section className="viewer-viewport">
          <RobotViewport />
        </section>

        <SidePane />
      </section>

      <footer className="viewer-status">Ready</footer>
    </main>
  )
}
