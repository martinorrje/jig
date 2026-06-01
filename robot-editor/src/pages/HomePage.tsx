import { Link } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'

export function HomePage() {
  const ready = useAuthStore((state) => state.ready)
  const user = useAuthStore((state) => state.user)
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <main>      
      <div className="auth-panel">
        <span className="auth-status">
          {!ready ? 'Checking session...' : user ? user.email : 'Editing locally'}
        </span>

        <button
          type="button"
          className="auth-button"
          onClick={user ? signOut : signInWithGitHub}
          disabled={!ready}
        >
          {user ? 'Sign out' : 'Sign in with GitHub'}
        </button>

        <Link className="primary-action" to="/projects/new">
          New project
        </Link>
      </div>
    </main>
  )
}
